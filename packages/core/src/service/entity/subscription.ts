import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm'
import MikanRssResolver from '../../mikan-rss-resolver.class.js'

/**
 * @class Subscription 订阅关系表
 * @property {number} id 自增主键
 * @property {number} bangumiID 番剧表主键
 * @property {number} seasonID 季表主键
 * @property {string} tmdbLink tmdb链接
 * @property {string} rssLink rss链接
 * @property {number} progress 当前进度（已经下载到第几话）
 * @property {string} resolver rss解析器
 *  @default 'Mikan' 蜜柑rss解析
 * @property {BangumiEpisodesFilter} filter 番剧过滤器
 *  @default {} 空对象，代表不进行过滤
 * @property {Date} createdAt 数据库创建时间
 * @property {Date} updatedAt 数据库最后修改时间
 */
@Entity()
export default class Subscription {
  @PrimaryGeneratedColumn({
    type: 'integer',
  })
  id: number

  @Index()
  @Column({
    name: 'bangumi_id',
    type: 'integer',
  })
  bangumiID: number

  @Index()
  @Column({
    name: 'season_id',
    type: 'integer',
  })
  seasonID: number

  @Column({
    name: 'tmdb_link',
    type: 'varchar',
    length: 300,
  })
  tmdbLink: string

  @Column({
    name: 'rss_link',
    type: 'varchar',
    length: 300,
  })
  rssLink: string

  @Column({
    type: 'integer',
  })
  progress: number = 0

  @Column({
    type: 'varchar',
    length: 20,
  })
  resolver: string = MikanRssResolver.ID

  @Column({
    type: 'simple-json',
  })
  filter: BangumiEpisodesFilter = {}

  @Column({
    type: 'boolean',
    default: true,
  })
  enabled: boolean

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date
}
