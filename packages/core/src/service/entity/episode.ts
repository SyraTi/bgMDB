import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

/**
 * @class Episode 话表
 * @property {number} id 自增主键
 * @property {number} bangumiID 番剧表主键
 * @property {number} seasonID 季表主键
 * @property {number} index 第几话
 * @property {string} title 话标题
 * @property {string} desc 话描述
 * @property {string} tmdbLink tmdb链接
 * @property {Date} pubDate 发布时间
 * @property {Date} createdAt 数据库创建时间
 * @property {Date} updatedAt 数据库最后修改时间
 */
@Entity()
export default class Episode {
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
    type: 'integer',
  })
  index: number

  @Column({
    type: 'varchar',
    length: 100,
  })
  title: string

  @Column({
    type: 'text',
  })
  desc: string

  @Column({
    name: 'tmdb_link',
    type: 'varchar',
    length: 300,
  })
  tmdbLink: string

  @Column({
    name: 'pub_date',
    type: 'date',
  })
  pubDate: Date

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date
}
