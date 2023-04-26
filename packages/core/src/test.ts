import BgMDB from './core.js'

BgMDB.add(
  'https://www.themoviedb.org/tv/198152/season/1',
  'https://mikanani.me/RSS/Bangumi?bangumiId=2883&subgroupid=382'
)
  .then((result: any) => {
    console.log(result)
    return BgMDB.add(
      'https://www.themoviedb.org/tv/76075/season/1',
      'https://mikanani.me/RSS/Bangumi?bangumiId=2883&subgroupid=382'
    )
  })
  .then((result: any) => {
    console.log(result)
    return BgMDB.add(
      'https://www.themoviedb.org/tv/76075/season/2',
      'https://mikanani.me/RSS/Bangumi?bangumiId=2883&subgroupid=382'
    )
  })
