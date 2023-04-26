import { IncomingMessage } from 'http'
import https from 'https'
import randomUserAgent from 'random-useragent'
import { parse } from 'node-html-parser'

export default class TMDB {
  public readonly valid: boolean = false

  private readonly _id: string = ''

  get id(): string {
    if (!this.valid) {
      throw new Error('TMDB link is not valid!')
    }
    return this._id
  }

  private readonly _season: number = -1

  get season(): number {
    if (!this.valid) {
      throw new Error('TMDB link is not valid!')
    }
    return this._season
  }

  private readonly _metaLink: string = ''

  get metaLink(): string {
    if (!this.valid) {
      throw new Error('TMDB link is not valid!')
    }
    return this._metaLink
  }

  get seasonLink(): string {
    if (!this.valid) {
      throw new Error('TMDB link is not valid!')
    }
    return `${this._metaLink}/season/${this._season}`
  }

  private readonly _bangumiMeta: Promise<BangumiMeta>

  get bangumiMeta(): Promise<BangumiMeta> {
    if (!this.valid) {
      throw new Error('TMDB link is not valid!')
    }
    return this._bangumiMeta
  }

  private readonly _seasonMeta: Promise<BangumiSeasonMeta>

  get seasonMeta(): Promise<BangumiSeasonMeta> {
    if (!this.valid) {
      throw new Error('TMDB link is not valid!')
    }
    return this._seasonMeta
  }

  private readonly _episodesMeta: Promise<BangumiEpisodesMeta[]>

  get episodesMeta(): Promise<BangumiEpisodesMeta[]> {
    if (!this.valid) {
      throw new Error('TMDB link is not valid!')
    }
    return this._episodesMeta
  }

  /**
   * 解析番剧信息
   * @private
   *
   * @return {Promise<BangumiMeta>}
   */
  private async _loadBangumiMeta(): Promise<BangumiMeta> {
    if (!this.valid) {
      throw new Error('TMDB link is not valid!')
    }
    const url = new URL(this._metaLink)
    const tmdbID = url.pathname.toLowerCase().match(/(\d+)\/?$/g)![0]
    const pageHTML: string = await new Promise((resolve, reject) => {
      const req = https.get(
        url.toString(),
        {
          headers: {
            'User-Agent': randomUserAgent.getRandom(),
            'Accept-Language': 'zh-CN',
            Host: url.host,
          },
        },
        (res: IncomingMessage) => {
          if (res.statusCode !== 200) {
            reject(res)
          }
          let rawData = ''
          res.on('data', (chunk: any) => {
            rawData += chunk
          })
          res.on('end', () => {
            resolve(rawData)
          })
        }
      )
      req.on('error', (err: Error) => {
        reject(err)
      })
    })
    const dom = parse(pageHTML)
    const chineseName =
      dom.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
      '未知'
    const localName =
      dom
        // eslint-disable-next-line max-len
        .querySelector(
          '#media_v4 > div > div > div.grey_column > div > section > div:nth-child(1) > div > section.facts.left_column > p.wrap'
        )
        ?.innerText.split(' ')[1] || '未知'
    const desc =
      dom
        .querySelector('meta[property="og:description"]')
        ?.getAttribute('content') || '无'
    const releaseYear = new Date(
      dom
        .querySelector('.release_date')
        ?.innerText.replace(/\((\d{4})\)/g, '$1-01-01') || '1970-01-01'
    )
    return {
      tmdbID,
      tmdbLink: this._metaLink,
      chineseName,
      localName,
      desc,
      releaseYear,
    }
  }

  /**
   * 解析番剧季信息
   * @private
   *
   * @return {Promise<BangumiSeasonMeta>}
   */
  private async _loadSeasonMeta(): Promise<BangumiSeasonMeta> {
    if (!this.valid) {
      throw new Error('TMDB link is not valid!')
    }
    const seasonListHTML: string = await new Promise((resolve, reject) => {
      const req = https.get(
        `${this._metaLink}/seasons`,
        {
          headers: {
            'User-Agent': randomUserAgent.getRandom(),
            'Accept-Language': 'zh-CN',
          },
        },
        (res: IncomingMessage) => {
          if (res.statusCode !== 200) {
            reject(res)
          }
          let rawData = ''
          res.on('data', (chunk: any) => {
            rawData += chunk
          })
          res.on('end', () => {
            resolve(rawData)
          })
        }
      )
      req.on('error', (err: Error) => {
        reject(err)
      })
    })
    const seasonHTML: string = await new Promise((resolve, reject) => {
      const req = https.get(
        this.seasonLink,
        {
          headers: {
            'User-Agent': randomUserAgent.getRandom(),
            'Accept-Language': 'zh-CN',
          },
        },
        (res: IncomingMessage) => {
          if (res.statusCode === 404) {
            throw new Error('TMDB season not exist!')
          }
          if (res.statusCode !== 200) {
            reject(res)
          }
          let rawData = ''
          res.on('data', (chunk: any) => {
            rawData += chunk
          })
          res.on('end', () => {
            resolve(rawData)
          })
        }
      )
      req.on('error', (err: Error) => {
        reject(err)
      })
    })
    const seasonListDOM = parse(seasonListHTML)
    const seasonDOM = parse(seasonHTML)
    const $targetSeason = seasonListDOM.querySelector(
      `.season_wrapper .season>a[href*="/season/${this._season}"] + .content`
    )
    if (!$targetSeason) {
      throw new Error('TMDB season not exist!')
    }
    const desc =
      seasonDOM
        .querySelector('meta[property="og:description"]')
        ?.getAttribute('content') || '暂无'
    const releaseYear = new Date(
      $targetSeason
        .querySelector('h4')
        ?.innerText.replace(/^(\d{4}) \| \d+ 集/g, '$1/01/01') || '1970/01/01'
    )
    return {
      index: this._season,
      tmdbLink: this.seasonLink,
      title: $targetSeason.querySelector('a[href]')!.innerText.trim(),
      desc,
      releaseYear,
    }
  }

  /**
   * 解析番剧集信息
   * @private
   *
   * @return {Promise<BangumiEpisodesMeta>[]}
   */
  private async _loadEpisodesMeta(): Promise<BangumiEpisodesMeta[]> {
    if (!this.valid) {
      throw new Error('TMDB link is not valid!')
    }
    const seasonHTML: string = await new Promise((resolve, reject) => {
      const req = https.get(
        this.seasonLink,
        {
          headers: {
            'User-Agent': randomUserAgent.getRandom(),
            'Accept-Language': 'zh-CN',
          },
        },
        (res: IncomingMessage) => {
          if (res.statusCode === 404) {
            throw new Error('TMDB season not exist!')
          }
          if (res.statusCode !== 200) {
            reject(res)
          }
          let rawData = ''
          res.on('data', (chunk: any) => {
            rawData += chunk
          })
          res.on('end', () => {
            resolve(rawData)
          })
        }
      )
      req.on('error', (err: Error) => {
        reject(err)
      })
    })
    const seasonDOM = parse(seasonHTML)
    return seasonDOM
      .querySelectorAll('.episode_list .card .episode')
      .map(($episode) => {
        const index = parseInt(
          $episode.querySelector('.episode_number')?.innerText || '-1'
        )
        return {
          index,
          title:
            $episode.querySelector('.info .title h3')?.innerText.trim() ||
            '暂无',
          desc:
            $episode.querySelector('.info .overview')?.innerText.trim() ||
            '暂无',
          tmdbLink: `${this.seasonLink}/episode/${index}`,
          pubDate: new Date(
            $episode
              .querySelector('.info .date span')
              ?.innerText.replace(
                /(\d{4}) 年 (\d{2}) 月 (\d{2}) 日/g,
                '$1/$2/$3'
              ) || '1970/01/01'
          ),
        }
      })
  }

  constructor(link: string) {
    // 校验格式
    if (
      /^http(s)?:\/\/www\.themoviedb\.org\/tv\/[^/]+\/season\/\d+\/?$/.test(
        link
      )
    ) {
      this.valid = true
      this._season = parseInt(link.match(/(\d+)\/?$/g)![0])
      this._metaLink = link.replace(/\/season\/\d+\/?$/g, '')
      this._id = this._metaLink.replace(
        /^http(s)?:\/\/www\.themoviedb\.org\/tv\//g,
        ''
      )
      this._bangumiMeta = this._loadBangumiMeta()
      this._seasonMeta = this._loadSeasonMeta()
      this._episodesMeta = this._loadEpisodesMeta()
    }
  }
}
