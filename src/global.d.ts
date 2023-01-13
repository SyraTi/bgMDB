type BangumiEpisodesFilter = {
  includes?: string[]
  excludes?: string[]
  regexp?: string
  hashBlackList?: string[]
}
type BangumiEpisode = {
  title: string
  link: string
  torrent: string
  torrentHash: string
  index: number
  pubDate: Date
}

type BangumiSeason = {
  index: string
  title: string
  RSS?: string
  progress: number
  episodes: BangumiEpisode[]
  filter?: BangumiEpisodesFilter
}

type BangumiMeta = {
  chineseName: string
  releaseDate: string
  localName: string
  seasons: BangumiSeason[]
  link: string
  id: string
  downloadTasks: BangumiDownloadTask[]
}

type BangumiDownloadTask = {
  gid: string
  season: BangumiSeason.index
  episode: BangumiEpisode.index
}

type Session = {
  bangumi: BangumiMeta[]
}
