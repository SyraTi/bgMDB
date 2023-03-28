import 'reflect-metadata'
import { DeepPartial, UpdateResult } from 'typeorm'
import MikanRssResolver from './mikan-rss-resolver.class.js'
import { service, entity } from './service/index.js'

export default class BgMDB {
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
    return service.subscriptionService.createSubscription({
      tmdbLink: tmdbSeasonLink,
      filter,
      rssLink,
      resolver,
    })
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
    return service.subscriptionService.editSubscription(id, {
      tmdbLink,
      rssLink,
      resolver,
      progress,
      filter,
    })
  }

  public list() {}

  public remove() {}

  public async update(id: number) {
    service.subscriptionService.updateSubscription(id)
  }

  public mark() {}
}
