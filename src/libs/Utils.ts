import { Duration, DurationFormatter } from '@sapphire/time-utilities'
import { promisify } from 'util'
import Colors from '../constants/Colors'
import Patterns from '../constants/Patterns'
import NoirClient from '../structures/Client'

export default class Utils {
  public client: NoirClient

  public constructor(client: NoirClient) {
    this.client = client
  }

  public capitalize(string: string, underscore?: boolean): string {
    string = string.charAt(0).toUpperCase() + string.slice(1)

    if (underscore) {
      string = string.replace(/_/, ' ')
    }

    return string
  }

  public async wait(rawDate: string): Promise<Duration | undefined> {
    const duration = new Duration(rawDate)
    const wait = promisify(setTimeout)

    if (Number.isNaN(duration.offset)) {
      return undefined
    }

    await wait(duration.fromNow.getTime() - new Date().getTime())

    return duration
  }

  public formatTime(ms: number): string {
    return new DurationFormatter().format(ms)
  }

  public formatURL(url: string): string | undefined {
    return Patterns.url.test(url) ? url : undefined
  }

  public formatBoolean(boolean?: string): boolean {
    return boolean?.toLowerCase() == 'true' ? true : false
  }

  public formatColor(color?: string): string | undefined {
    if (color) {
      if (Patterns.color.test(color)) {
        return color
      }

      color = color.toLowerCase()

      if (color == 'green') {
        return Colors.primaryHex
      } else if (color == 'gray') {
        return Colors.secondaryHex
      } else if (color == 'yellow') {
        return '#ffcc33'
      } else if (color == 'blue') {
        return '#338bff'
      } else if (color == 'red') {
        return Colors.warningHex
      } else if (color == 'embed') {
        return Colors.embedHex
      }
    }

    return undefined
  }
}