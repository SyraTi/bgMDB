import { DataSource } from 'typeorm'
import {
  Subscription,
  Bangumi,
  Season,
  Episode,
  DownloadTask,
} from './entity/index.js'

const dataSource = new DataSource({
  type: 'sqlite',
  database: 'bgmdb.sqlite',
  synchronize: true,
  logging: false,
  entities: [Subscription, Bangumi, Season, Episode, DownloadTask],
})
// eslint-disable-next-line import/prefer-default-export
export const dbReady = async () => {
  return dataSource.isInitialized ? dataSource : dataSource.initialize()
}
