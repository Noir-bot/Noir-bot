import { Duration, DurationFormatter } from '@sapphire/time-utilities'
import { promisify } from 'util'
import Colors from '../constants/Colors'
import Patterns from '../constants/Patterns'
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


  public async wait(ms: string) {
    const duration = new Duration(ms)
    const wait = promisify(setTimeout)

    if (Number.isNaN(duration.offset)) {
      return undefined
    }

    await wait(duration.fromNow.getTime() - new Date().getTime())

    return duration
  }

  public formatTime(ms: number) {
    return new DurationFormatter().format(ms)
  }

  public formatURL(url: string) {
    return Patterns.url.test(url) ? url : undefined
  }

  public formatBoolean(boolean?: string) {
    return boolean?.toLowerCase() == 'true' ? true : false
  }

  public formatColor(color?: string) {
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