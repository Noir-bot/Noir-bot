import { Duration } from '@sapphire/time-utilities'
import { promisify } from 'util'
import NoirClient from '../structures/Client'

export default class NoirUtils {
  public client: NoirClient

  constructor(client: NoirClient) {
    this.client = client
  }

  public capitalize(paragraph: string, underscore?: boolean) {
    return underscore ? (paragraph.charAt(0).toUpperCase() + paragraph.slice(1)).replace(/_/, ' ') : paragraph.charAt(0).toUpperCase() + paragraph.slice(1)
  }

  public convertSeconds(seconds: number) {
    return seconds >= 60 ? seconds >= 3600 ? seconds / 3600 + ' hours' : seconds / 60 + ' minutes' : seconds + ' seconds'
  }

  public async wait(pattern: string): Promise<Duration | undefined> {
    const duration = new Duration(pattern)
    const wait = promisify(setTimeout)

    if (Number.isNaN(duration.offset)) {
      return undefined
    }

    await wait(duration.fromNow.getTime() - new Date().getTime())
    return duration
  }
}