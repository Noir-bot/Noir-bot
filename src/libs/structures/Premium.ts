export default class NoirPremium {
  private guild: string
  private expireAt: Date
  private _status: boolean

  constructor(guild: string, expireAt: Date, status: boolean) {
    this.guild = guild
    this.expireAt = expireAt
    this._status = status
  }

  public get status() {
    return this._status
  }

  public set status(status: boolean) {
    this._status = status
  }

  public valid(): boolean {
    if (!this.status) {
      return false
    }

    return true
  }

  public expired(): boolean {
    if (new Date().getTime() >= this.expireAt.getTime()) {
      return true
    }

    return false
  }
}