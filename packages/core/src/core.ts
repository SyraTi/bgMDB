import 'reflect-metadata'
import { DeepPartial, UpdateResult } from 'typeorm'
import MikanRssResolver from './mikan-rss-resolver.class.js'
import TMDB from './tmdb.class.js'
import RssResolver from './rss-resolver.js'
import { service, entity } from './service/index.js'

export default class BgMDB {
  private static readonly _resolverIDs: Map<string, typeof RssResolver> =
    new Map<string, typeof RssResolver>([
      [MikanRssResolver.ID, MikanRssResolver],
    ])

  public static registerRssResolver(Resolver: typeof RssResolver) {
    BgMDB._resolverIDs.set(Resolver.ID, Resolver)
  }

  /**
   * 添加订阅
   * @param {string} tmdbSeasonLink tmdb的季链接
   * @param {string} rssLink rss链接
   * @param {string} resolver 解析器id 默认使用内置的Mikan解析器
   * @param {BangumiEpisodesFilter} filter 剧集过滤器
   *
   * @return {Promise<string>} id 订阅关系主键
   */
  public static async add(
    tmdbSeasonLink: string,
    rssLink: string,
    filter: BangumiEpisodesFilter = {},
    resolver: string = MikanRssResolver.ID
  ): Promise<void | {
    bangumi: entity.Bangumi
    season: entity.Season
    subscription: entity.Subscription
  }> {
    const tmdb = new TMDB(tmdbSeasonLink)
    if (!tmdb.valid) {
      throw new Error('TMDB season link is not valid.')
    }
    return service.subscriptionService.createSubscription(
      {
        tmdbLink: tmdb.seasonLink,
        filter,
        rssLink,
        resolver,
      },
      await tmdb.bangumiMeta,
      await tmdb.seasonMeta,
      await tmdb.episodesMeta
    )
  }

  /**
   * 编辑订阅
   * @param {number} id 订阅关系主键
   * @param {string} tmdbSeasonLink tmdb的季链接
   * @param {string} rssLink rss链接
   * @param {string} resolver 解析器id 默认使用内置的Mikan解析器
   * @param {BangumiEpisodesFilter} filter 过滤器
   *
   */
  public static async edit(
    id: number,
    {
      tmdbLink,
      rssLink,
      resolver,
      progress,
      filter,
    }: DeepPartial<
      Pick<
        entity.Subscription,
        'tmdbLink' | 'rssLink' | 'resolver' | 'progress' | 'filter'
      >
    >
  ): Promise<UpdateResult> {
    return service.subscriptionService.updateSubscription(id, {
      tmdbLink,
      rssLink,
      resolver,
      progress,
      filter,
    })
  }

  public list() {}

  public remove() {}

  public update() {
    // 读取数据库
    // 读取progress
    // 读取rsslink 以及rssresolver
    // 通过rss resolver 进行解析 得到最新的集列表
    // 与progress进行对比
    // 将未下载的集发送给aria
    // 标记最新的progress
  }

  public mark() {}
}
