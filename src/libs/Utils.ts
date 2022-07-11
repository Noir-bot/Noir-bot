import { Duration, DurationFormatter } from '@sapphire/time-utilities'
import { promisify } from 'util'
import NoirClient from '../structures/Client'

export default class Utils {
  public client: NoirClient

  constructor(client: NoirClient) {
    this.client = client
  }

  public capitalize(string: string, underscore?: boolean) {
    string = string.charAt(0).toUpperCase() + string.slice(1)

    if (underscore) {
      string = string.replace(/_/, ' ')
    }

    return string
  }

  public formatTime(ms: number) {
    return new DurationFormatter().format(ms)
  }

  public async wait(ms: string) {
    const duration = new Duration(ms)
    const wait = promisify(setTimeout)

    if (Number.isNaN(duration.offset)) {
      return undefined
    }

    await wait(duration.fromNow.getTime() - new Date().getTime())

    return duration
  }
}