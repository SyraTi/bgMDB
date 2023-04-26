import { DataSource, DeepPartial, Repository, UpdateResult } from 'typeorm'
import { dbReady } from './data-source.js'
import { Subscription, Bangumi, Season, Episode } from './entity/index.js'

export default class SubscriptionService {
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
    >,
    bangumi: Pick<
      Bangumi,
      | 'tmdbID'
      | 'tmdbLink'
      | 'chineseName'
      | 'localName'
      | 'desc'
      | 'releaseYear'
    >,
    season: Pick<
      Season,
      'tmdbLink' | 'index' | 'title' | 'desc' | 'releaseYear'
    >,
    episodes: Pick<
      Episode,
      'index' | 'title' | 'desc' | 'tmdbLink' | 'pubDate'
    >[]
  ): Promise<void | {
    bangumi: Bangumi
    season: Season
    subscription: Subscription
    episodes: Episode[]
  }> {
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

  async updateSubscription(
    id: number,
    entityLike: DeepPartial<Subscription>
  ): Promise<UpdateResult> {
    await this._dbReady
    return this._subscriptionRepo.update(id, entityLike)
  }

  // async listSubscription(): Promise<Array<Subscription>> {
  //   const allBangumis = this._bangumiRepo.find()
  //   const allSeasons = this._bangumiRepo.find()
  //   const allSubscription = this._subscriptionRepo.find()
  // }
}
