export default class NoirPremium {
  private guild: string
  private expireAt: Date

  constructor(guild: string, expireAt: Date) {
    this.guild = guild
    this.expireAt = expireAt
  }

  public valid(): boolean {
    if (this.expireAt.getTime() <= new Date().getTime()) {
      return true
    }

    return false
  }
}