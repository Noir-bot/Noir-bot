export default class Premium {
  private expireAt: Date
  private _status: boolean

  constructor(expireAt: Date, status: boolean) {
    this.expireAt = expireAt
    this._status = status
  }

  public get status() {
    return this._status
  }

  public set status(status: boolean) {
    this._status = status
  }

  public expired() {
    return new Date().getTime() >= this.expireAt.getTime()
  }
}