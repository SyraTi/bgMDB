import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

/**
 * @class Bangumi 番剧实体
 * @property {number} id 自增主键
 * @property {string} tmdbID tmdb番剧id 即链接中 /tv/{xxx} 花括号包含部分
 * @property {string} tmdbLink tmdb链接
 * @property {string} chineseName 番剧中文名称
 * @property {string} localName 番剧本地名称
 * @property {Date} releaseDate 发布时间
 * @property {Date} createdAt 数据库创建时间
 * @property {Date} updatedAt 数据库最后修改时间
 */
@Entity()
export default class Bangumi {
  @PrimaryGeneratedColumn({
    type: 'integer',
  })
  id: number

  @Index()
  @Column({
    name: 'tmdb_id',
    type: 'varchar',
    length: 20,
  })
  tmdbID: string

  @Column({
    name: 'tmdb_link',
    type: 'varchar',
    length: 300,
  })
  tmdbLink: string

  @Column({
    name: 'chinese_name',
    type: 'varchar',
    length: 20,
  })
  chineseName: string

  @Column({
    name: 'local_name',
    type: 'varchar',
    length: 20,
  })
  localName: string

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
