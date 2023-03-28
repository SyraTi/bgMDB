export default abstract class RssResolver {
  public static readonly ID: string = 'Raw'

  protected readonly link: string = ''

  protected readonly valid: boolean = false

  constructor(link: string) {
    this.link = link
    this.valid = this.validateLink()
  }

  abstract validateLink(): boolean

  // fetchList() {}
}
