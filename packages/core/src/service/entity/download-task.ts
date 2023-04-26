import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

/**
 * @class DownloadTask 下载任务
 * @property {number} id 自增主键
 * @property {string} gid 下载工具主键 (目前只针对Aria)
 * @property {number} bangumiID 番剧表主键
 * @property {number} seasonID 季表主键
 * @property {number} episodeID 话表主键
 * @property {Date} createdAt 数据库创建时间
 * @property {Date} updatedAt 数据库最后修改时间
 */
@Entity()
export default class DownloadTask {
  @PrimaryGeneratedColumn({
    type: 'integer',
  })
  id: number

  @Index()
  @Column({
    type: 'varchar',
    length: 20,
  })
  gid: string

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

  @Index()
  @Column({
    name: 'episode_id',
    type: 'integer',
  })
  episodeID: number

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date
}
