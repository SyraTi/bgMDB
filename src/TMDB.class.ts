import { IncomingMessage } from 'http'
import https from 'https'
import randomUserAgent from 'random-useragent'
import { parse } from 'node-html-parser'

export default class TMDB {
  /**
   * 解析番剧信息
   * @param {string} link tmdb链接
   *  @example https://www.themoviedb.org/tv/xxx
   * @private
   *
   * @return {Promise<Omit<BangumiMeta, 'seasons'>>}
   */
  private static async _parseInfo(
    link: string
  ): Promise<Omit<BangumiMeta, 'seasons'>> {
    const url = new URL(link)
    const id = url.pathname.toLowerCase()
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
    const releaseDate = dom.querySelector('.release_date')?.innerText || '未知'
    const localName =
      dom
        // eslint-disable-next-line max-len
        .querySelector(
          '#media_v4 > div > div > div.grey_column > div > section > div:nth-child(1) > div > section.facts.left_column > p.wrap'
        )
        ?.innerText.split(' ')[1] || '未知'
    return {
      id,
      chineseName,
      releaseDate,
      localName,
      link: url.toString(),
      downloadTasks: [],
    }
  }

  /**
   * 解析番剧季信息
   * @param {string} link tmdb链接
   *  @example https://www.themoviedb.org/tv/xxx
   * @private
   *
   * @return {Promise<BangumiSeason[]>}
   */
  private static async _parseSeason(link: string): Promise<BangumiSeason[]> {
    const seasonsHTML: string = await new Promise((resolve, reject) => {
      const req = https.get(
        `${link}/seasons`,
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
    const dom = parse(seasonsHTML)
    return dom
      .querySelectorAll('.season_wrapper .season .content a[href]')
      .map(($a) => ({
        index:
          $a.getAttribute('href')?.replace(/^.*season\/(.*)$/g, 'S$1') || '',
        title: $a.innerText,
        progress: 0,
        episodes: [],
      }))
  }

  /**
   * 解析番剧元信息
   * @param {string} link tmdb链接
   *  @example https://www.themoviedb.org/tv/xxx
   *
   * @return {Promise<BangumiMeta>}
   */
  static async parse(link: string): Promise<BangumiMeta> {
    const [infos, seasons] = await Promise.all([
      this._parseInfo(link),
      this._parseSeason(link),
    ])
    return {
      ...infos,
      seasons,
    }
  }
}
