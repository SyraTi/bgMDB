import { DataSource, DeepPartial, Repository, UpdateResult } from 'typeorm'
import { dbReady } from './data-source.js'
import { Subscription, Bangumi, Season, Episode } from './entity/index.js'
import MikanRssResolver from '../mikan-rss-resolver.class.js'
import RssResolver from '../rss-resolver.js'
import TMDB from '../tmdb.class.js'

type ChildOfRssResolver = (new (link: string) => RssResolver) &
  typeof RssResolver

export default class SubscriptionService {
  private static readonly _registeredRssResolver: Map<
    string,
    ChildOfRssResolver
  > = new Map<string, ChildOfRssResolver>([
    [MikanRssResolver.ID, MikanRssResolver],
  ])

  public static registerRssResolver(Resolver: ChildOfRssResolver) {
    SubscriptionService._registeredRssResolver.set(Resolver.ID, Resolver)
  }

  private readonly _dbReady: Promise<DataSource>

  private _subscriptionRepo: Repository<Subscription>

  private _seasonRepo: Repository<Season>

  private _episodeRepo: Repository<Episode>

  private _bangumiRepo: Repository<Bangumi>

  constructor() {
    this._dbReady = dbReady().then((dataSource) => {
      this._subscriptionRepo = dataSource.getRepository(Subscription)
      this._seasonRepo = dataSource.getRepository(Season)
      this._bangumiRepo = dataSource.getRepository(Bangumi)
      this._episodeRepo = dataSource.getRepository(Episode)
      return dataSource
    })
  }

  async createSubscription(
    subscription: Pick<
      Subscription,
      'tmdbLink' | 'rssLink' | 'resolver' | 'filter'
    >
  ): Promise<void | {
    bangumi: Bangumi
    season: Season
    subscription: Subscription
    episodes: Episode[]
  }> {
    const tmdb = new TMDB(subscription.tmdbLink)
    if (!tmdb.valid) {
      throw new Error('TMDB season link is not valid.')
    }
    const bangumi = await tmdb.bangumiMeta
    const season = await tmdb.seasonMeta
    const episodes = await tmdb.episodesMeta
    const dbSource = await this._dbReady
    return dbSource.manager.transaction<{
      bangumi: Bangumi
      season: Season
      subscription: Subscription
      episodes: Episode[]
    }>(async (transactionalEntityManager) => {
      // 查找是否已经订阅过该番剧
      let entityBangumi = await this._bangumiRepo.findOneBy({
        tmdbID: bangumi.tmdbID,
      })
      if (!entityBangumi) {
        entityBangumi = this._bangumiRepo.create(bangumi)
        await transactionalEntityManager.save(entityBangumi)
      } else {
        await transactionalEntityManager.update(
          Bangumi,
          { id: entityBangumi.id },
          bangumi
        )
      }
      // 是否已经订阅过该季
      let entitySeason = await this._seasonRepo.findOneBy({
        bangumiID: entityBangumi.id,
        index: season.index,
      })
      if (!entitySeason) {
        entitySeason = this._seasonRepo.create(season)
        entitySeason.bangumiID = entityBangumi.id
        await transactionalEntityManager.save(entitySeason)
      } else {
        await transactionalEntityManager.update(
          Season,
          { id: entitySeason.id },
          season
        )
      }
      const episodesEntities = []
      for (let i = 0; i < episodes.length; i++) {
        const episode = episodes[i]
        let entityEpisode = await this._episodeRepo.findOneBy({
          bangumiID: entityBangumi.id,
          seasonID: entitySeason.id,
          index: episode.index,
        })

        if (!entityEpisode) {
          entityEpisode = this._episodeRepo.create(episode)
          entityEpisode.bangumiID = entityBangumi.id
          entityEpisode.seasonID = entitySeason.id
          await transactionalEntityManager.save(entityEpisode)
        } else {
          await transactionalEntityManager.update(
            Episode,
            { id: entityEpisode.id },
            episode
          )
        }
        episodesEntities.push(entityEpisode)
      }
      // 是否已经建立过该订阅
      let entitySubscription = await this._subscriptionRepo.findOneBy({
        bangumiID: entityBangumi.id,
        seasonID: entitySeason.id,
      })
      if (!entitySubscription) {
        entitySubscription = this._subscriptionRepo.create(subscription)
        entitySubscription.bangumiID = entityBangumi.id
        entitySubscription.seasonID = entitySeason.id
        await transactionalEntityManager.save(entitySubscription)
      } else {
        await transactionalEntityManager.update(
          Subscription,
          { id: entitySubscription.id },
          subscription
        )
      }
      return {
        bangumi: entityBangumi,
        season: entitySeason,
        episodes: episodesEntities,
        subscription: entitySubscription,
      }
    })
  }

  async editSubscription(
    id: number,
    entityLike: DeepPartial<Subscription>
  ): Promise<UpdateResult> {
    await this._dbReady
    return this._subscriptionRepo.update(id, entityLike)
  }

  /* in development
  async updateSubscription(id: number) {
    // 读取数据库
    const subscription = await this._subscriptionRepo.findOneBy({ id })
    if (!subscription) return
    // 读取progress,rsslink 以及rssresolver
    const { progress, rssLink, resolver } = subscription
    // 通过rss resolver 进行解析 得到最新的集列表
    const Resolver = SubscriptionService._registeredRssResolver.get(resolver)
    if (!Resolver) return
    const rssResolver = new Resolver(rssLink)

    // 与progress进行对比
    // 将未下载的集发送给aria
    // 标记最新的progress
  }
  */

  // async listSubscription(): Promise<Array<Subscription>> {
  //   const allBangumis = this._bangumiRepo.find()
  //   const allSeasons = this._bangumiRepo.find()
  //   const allSubscription = this._subscriptionRepo.find()
  // }
}
