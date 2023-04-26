export default abstract class RssResolver {
  public static readonly ID: string = 'Raw'

  protected readonly link: string = ''

  protected readonly valid: boolean = false

  protected constructor(link: string) {
    this.link = link
    this.valid = this.validateLink()
  }

  validateLink(): boolean {
    return true
  }
}
