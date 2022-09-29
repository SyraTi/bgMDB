import Parser from 'rss-parser'
import path from 'path'
import CN2Arabic from 'chinese-numbers-to-arabic'
import rl from './readline.js'
import aria2Conn from './aria2Conn.js'

const rssParser = new Parser()

const FETCH_EPISODE_WITH_BRACKETS = new RegExp(
  '[【\\[]E?(\\d+)\\s?(?:END)?[】\\]]'
)
const FETCH_EPISODE_ZH = new RegExp('第?\\s?(\\d{1,3})\\s?[話话集]')
const FETCH_EPISODE_ALL_ZH = new RegExp('第([^第]*?)[話话集]')
const FETCH_EPISODE_ONLY_NUM = new RegExp('^([\\d]{2,})$')

const FETCH_EPISODE_RANGE = new RegExp('[^sS][\\d]{2,}\\s?-\\s?([\\d]{2,})')
const FETCH_EPISODE_RANGE_ZH = new RegExp(
  '[第][\\d]{2,}\\s?-\\s?([\\d]{2,})\\s?[話话集]'
)
const FETCH_EPISODE_RANGE_ALL_ZH_1 = new RegExp('[全]([\\d-]*?)[話话集]')
const FETCH_EPISODE_RANGE_ALL_ZH_2 = new RegExp('第?(\\d-\\d)[話话集]')

const FETCH_EPISODE_OVA_OAD = new RegExp('([\\d]{2,})\\s?\\((?:OVA|OAD)\\)]')
const FETCH_EPISODE_WITH_VERSION = new RegExp(
  '[【\\[](\\d+)\\s? *v\\d(?:END)?[】\\]]'
)

const FETCH_EPISODE: RegExp[] = [
  FETCH_EPISODE_ZH,
  FETCH_EPISODE_ALL_ZH,
  FETCH_EPISODE_WITH_BRACKETS,
  FETCH_EPISODE_ONLY_NUM,
  FETCH_EPISODE_RANGE,
  FETCH_EPISODE_RANGE_ALL_ZH_1,
  FETCH_EPISODE_RANGE_ALL_ZH_2,
  FETCH_EPISODE_OVA_OAD,
  FETCH_EPISODE_WITH_VERSION,
]

const { BGMDB_SAVE_PATH } = process.env

export default class MikanAni {
  /**
   * 匹配MikanRSS订阅
   * @param {BangumiMeta} metaInfo 番剧信息对象
   *
   * @return {Promise<BangumiMeta>} 匹配完成后的番剧信息对象
   */
  static async match(metaInfo: BangumiMeta): Promise<BangumiMeta> {
    console.log(`《${metaInfo.chineseName}》RSS匹配开始！`)
    for (let i = 0; i < metaInfo.seasons.length; i++) {
      const season = metaInfo.seasons[i]
      console.log(`现在开始匹配《${season.index}-${season.title}》`)
      season.RSS = await this._inputRSS(season)
      await this._feed(season)
    }

    const ifDownload = await new Promise((resolve) => {
      rl.question(
        '匹配完成！ 需要下载全部已有内容吗？(y/n)',
        (yesOrNo: string) => {
          if (yesOrNo.toLowerCase() === 'y') resolve(true)
          resolve(false)
        }
      )
    })
    if (ifDownload) {
      metaInfo.downloadTasks = await this._download(metaInfo)
    }
    return metaInfo
  }

  /**
   * 更新订阅的番剧
   * @param {BangumiMeta} metaInfo 番剧信息对象
   */
  static async update(metaInfo: BangumiMeta): Promise<BangumiDownloadTask[]> {
    for (const season of metaInfo.seasons) {
      if (!season.RSS) continue
      const episodes = await this._getEpisodesFromFeed(season.RSS)
      const epToUpdate = this._filterEpisodes(
        episodes.filter((ep) => ep.index > season.progress),
        season.filter
      )
      if (epToUpdate) {
        // 更新订阅数据
        season.episodes = episodes
      }
    }
    return this._download(metaInfo)
  }

  /**
   * 下载番剧
   * @param {BangumiMeta} metaInfo 用于下载的番剧信息对象
   * @private
   */
  private static async _download(
    metaInfo: BangumiMeta
  ): Promise<BangumiDownloadTask[]> {
    const downloadTasks: BangumiDownloadTask[] = []
    if (!BGMDB_SAVE_PATH) {
      console.log(`下载路径不存在，请检查配置`)
      return downloadTasks
    }
    console.log(`${metaInfo.chineseName} 开始下载...`)
    const bangumiDir = path.resolve(
      BGMDB_SAVE_PATH,
      `./${metaInfo.localName}${metaInfo.releaseDate}/`
    )
    console.log(`保存路径：${bangumiDir} `)
    for (const season of metaInfo.seasons) {
      if (!season.RSS) continue
      const seasonDir = path.resolve(bangumiDir, `./${season.index}/`)
      console.log(`${season.index}-${season.title} 开始下载...`)
      console.log(`保存路径：${seasonDir} `)
      const episodeList = this._filterEpisodes(
        season.episodes || [],
        season.filter
      )
      let { progress } = season
      for (const ep of episodeList) {
        if (ep.index <= season.progress) continue
        if (ep.index > progress) progress = ep.index
        downloadTasks.push({
          gid: await aria2Conn.call('addUri', [ep.torrent], {
            dir: seasonDir,
          }),
          season: season.index,
          episode: ep.index,
        })

        console.log(`第${ep.index}话 | ${ep.title} 已发送至Aria2.`)
      }
      season.progress = progress
    }
    return downloadTasks
  }

  /**
   * 交互输入RSS链接
   * @param {BangumiSeason} season 季对象
   * @private
   *
   * @return {Promise<string>} 最终确认的RSS链接
   */
  private static async _inputRSS(season: BangumiSeason): Promise<string> {
    return new Promise<string>((resolve) => {
      rl.question(
        `请输入《${season.index}-${season.title}》对应的蜜柑计划RSS链接，如需要略过本季可以直接留空\n` +
          '例如：https://mikanani.me/RSS/Bangumi?bangumiId=2206&subgroupid=37\n',
        (answer: string) => {
          if (!answer) {
            resolve('')
            console.log(
              `链接为空，《${season.index}-${season.title}》将不会订阅`
            )
            return
          }
          if (
            !answer.match(
              new RegExp(
                '^https://mikanani.me/RSS/Bangumi\\?bangumiId=\\d+&subgroupid=\\d+$',
                'i'
              )
            )
          ) {
            console.log(
              'RSS链接格式不正确，检查是否正确包含bangumiId以及subgroupid，请重新输入！'
            )
            resolve(this._inputRSS(season))
          }
          resolve(answer)
        }
      )
    })
  }

  /**
   * 从标题解析出当前是第几话
   * @param {string} title 标题
   * @private
   *
   * @return {number} 第几话
   */
  private static _parseEpisodeNumber(title: string): number {
    let spare
    let matchResult
    for (const pattern of [
      FETCH_EPISODE_RANGE_ALL_ZH_1,
      FETCH_EPISODE_RANGE_ALL_ZH_2,
    ]) {
      matchResult = title.match(pattern)
      if (matchResult && matchResult[1]) {
        return -1
      }
    }

    matchResult = title.match(FETCH_EPISODE_RANGE)
    if (matchResult && matchResult[1]) {
      return -1
    }

    matchResult = title.match(FETCH_EPISODE_RANGE_ZH)
    if (matchResult && matchResult[1]) {
      return -1
    }

    matchResult = title.match(FETCH_EPISODE_ZH)
    if (
      matchResult &&
      matchResult[1] &&
      !Number.isNaN(parseInt(matchResult[1]))
    ) {
      return parseInt(matchResult[1])
    }

    matchResult = title.match(FETCH_EPISODE_ALL_ZH)
    if (matchResult && matchResult[1]) {
      try {
        return CN2Arabic.toInteger(matchResult[1])
      } catch (e) {
        console.log('to arabic fail')
      }
    }

    matchResult = title.match(FETCH_EPISODE_WITH_VERSION)
    if (
      matchResult &&
      matchResult[1] &&
      !Number.isNaN(parseInt(matchResult[1]))
    ) {
      return parseInt(matchResult[1])
    }
    matchResult = title.match(FETCH_EPISODE_WITH_BRACKETS)
    if (matchResult) {
      return Math.min(...matchResult.splice(1).map(parseInt))
    }
    const rest: number[] = []
    for (const i of title.replace(/\[/g, ' ').replace(/【/g, ',').split(' ')) {
      for (const regexp of FETCH_EPISODE) {
        const match = i.match(regexp)
        if (match && match[1] && !Number.isNaN(parseInt(match[1]))) {
          const m = parseInt(match[1])
          if (m > 1000) {
            spare = m
          } else {
            rest.push(m)
          }
        }
      }
    }
    if (rest.length > 0) {
      return Math.min(...rest)
    }
    if (spare) {
      return spare
    }
    return -1
  }

  /**
   * 根据筛选规则筛选话
   * @param {BangumiEpisode[]} episodes 话列表
   * @param {BangumiEpisodesFilter} filter 筛选规则
   * @private
   *
   * @return {BangumiEpisode[]} 筛选过后的话列表
   */
  private static _filterEpisodes(
    episodes: BangumiEpisode[],
    filter: BangumiEpisodesFilter = {}
  ): BangumiEpisode[] {
    episodes = episodes.filter((ep: BangumiEpisode) => ep.index !== -1)
    let exp: RegExp
    if (filter.includes) {
      exp = new RegExp(
        `(${filter.includes
          .map((str) => str.replace(/([[\\^$.|?*+()])/g, '\\$1'))
          .map((str) => `(?=.*${str})`)
          .join('')})`
      )
      episodes = episodes.filter((ep) => exp.test(ep.title))
    }
    if (filter.excludes) {
      exp = new RegExp(
        `(${filter.excludes
          .map((str) => str.replace(/([[\\^$.|?*+()])/g, '\\$1'))
          .join('|')})`
      )
      episodes = episodes.filter((ep) => !exp.test(ep.title))
    }
    if (filter.regexp) {
      const regexp = filter.regexp.replace(/^\//, '').split('/')
      exp = new RegExp(regexp[0], regexp[1])
      episodes = episodes.filter((ep) => !exp.test(ep.title))
    }
    return episodes
  }

  /**
   * 构建话筛选规则
   * @param {BangumiEpisode[]} episodes 话列表
   * @param {BangumiEpisodesFilter} filter 筛选规则
   * @private
   *
   * @return {Promise<BangumiEpisodesFilter>} 含有筛选规则的季对象
   */
  private static async _buildEpisodeFilter(
    episodes: BangumiEpisode[],
    filter: BangumiEpisodesFilter = {}
  ): Promise<BangumiEpisodesFilter> {
    const filterResult = this._filterEpisodes(episodes, filter)

    console.log(
      '当前筛选后的结果如下：',
      filterResult.map((ep) => `第${ep.index}话 | 标题：${ep.title}`)
    )

    const timeCounter = filterResult.reduce<Map<number, number>>(
      (counter, ep) => {
        counter.set(ep.index, (counter.get(ep.index) || 0) + 1)
        return counter
      },
      new Map<number, number>()
    )

    const episodeNumbers = Array.from(timeCounter.keys())
    const times = Array.from(timeCounter.values())
    let ifContinue = false
    if (times.find((time) => time > 1)) {
      console.log('*发现有重复的话/集*')
      ifContinue = true
    }
    if (
      episodeNumbers.length !==
      Math.max(...episodeNumbers) - Math.min(...episodeNumbers) + 1
    ) {
      console.log('*发现有缺少的话/集（不连贯）*')
      ifContinue = true
    }
    if (ifContinue) {
      console.log('请继续完善筛选条件：')
      console.log('1.条件可以留空')
      console.log('2.筛选只适用于标题')
      filter.includes = await new Promise((resolve) => {
        rl.question(
          `请输入想要包含的文字，多个请以英文逗号(,)隔开, 当前值：${
            filter?.includes || '无'
          }\n`,
          (includes: string) => {
            if (!includes) resolve(undefined)
            resolve(includes.split(','))
          }
        )
        if (filter?.includes?.length) {
          rl.write(filter.includes.join(','))
        }
      })
      filter.excludes = await new Promise((resolve) => {
        rl.question(
          `请输入想要排除的文字，多个请以英文逗号(,)隔开, 当前值：${
            filter?.excludes || '无'
          }\n`,
          (excludes: string) => {
            if (!excludes) resolve(undefined)
            resolve(excludes.split(','))
          }
        )
        if (filter?.excludes?.length) {
          rl.write(filter.excludes.join(','))
        }
      })
      filter.regexp = await new Promise((resolve) => {
        rl.question(
          `请输入想要匹配的正则表达式，如/^123$/gi, 当前值：${
            filter?.regexp || '无'
          }\n`,
          (regexp: string) => {
            if (!regexp) resolve(undefined)
            resolve(regexp)
          }
        )
        if (filter?.regexp) {
          rl.write(filter.regexp)
        }
      })
      return this._buildEpisodeFilter(episodes, filter)
    }
    console.log('筛选完成！')
    return filter
  }

  /**
   * 使用RSS信息填充季对象
   * @param {BangumiSeason} season 季对象
   * @private
   *
   * @return {Promise<BangumiSeason>} 填充完成后的季对象
   */
  private static async _feed(season: BangumiSeason): Promise<BangumiSeason> {
    if (!season.RSS) return season
    season.episodes = await this._getEpisodesFromFeed(season.RSS)
    season.filter = await this._buildEpisodeFilter(season.episodes)
    return season
  }

  private static async _getEpisodesFromFeed(
    url: string
  ): Promise<BangumiEpisode[]> {
    const feed = await rssParser.parseURL(url)
    return feed.items.map((item: Parser.Item) => ({
      title: item.title || '',
      link: item.link || '',
      torrent: item.enclosure?.url || '',
      index: this._parseEpisodeNumber(item.title || ''),
    }))
  }
}
