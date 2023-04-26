import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

/**
 * @class Season 季表
 * @property {number} id 自增主键
 * @property {number} bangumiID 番剧表主键
 * @property {string} tmdbLink tmdb链接
 * @property {number} index 第几季
 * @property {string} title 季标题
 * @property {string} desc 季描述
 * @property {Date} createdAt 数据库创建时间
 * @property {Date} updatedAt 数据库最后修改时间
 */
@Entity()
export default class Season {
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

  @Column({
    name: 'tmdb_link',
    type: 'varchar',
    length: 300,
  })
  tmdbLink: string

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
    name: 'release_year',
    type: 'date',
  })
  releaseYear: Date

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date
}
