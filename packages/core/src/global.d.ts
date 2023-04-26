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

type BangumiEpisodesMeta = {
  index: number
  title: string
  desc: string
  tmdbLink: string
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
type BangumiSeasonMeta = {
  tmdbLink: string
  index: number
  title: string
  desc: string
  releaseYear: Date
}

type BangumiMetaBak = {
  chineseName: string
  releaseDate: string
  localName: string
  seasons: BangumiSeasonMeta[]
  tmdbLink: string
  id: string
  downloadTasks: BangumiDownloadTask[]
}
type BangumiMeta = {
  tmdbID: string
  tmdbLink: string
  localName: string
  chineseName: string
  desc: string
  releaseYear: Date
}

type BangumiDownloadTask = {
  gid: string
  season: BangumiSeason.index
  episode: BangumiEpisode.index
}

type Session = {
  bangumi: BangumiMeta[]
}
