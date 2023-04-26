import RssResolver from './rss-resolver.js'

export default class MikanRssResolver extends RssResolver {
  public static readonly ID: string = 'Mikan'

  validateLink(): boolean {
    return false
  }
}
