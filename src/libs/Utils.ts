import { Duration, DurationFormatter } from '@sapphire/time-utilities'
import { Interaction } from 'discord.js'
import { promisify } from 'util'
import Colors from '../constants/Colors'
import Options from '../constants/Options'
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

  public premiumStatus(guild: string) {
    return this.client.premium.get(guild)?.status ?? false
  }

  public removeFormatValue(value?: string) {
    return value == Options.removeValue ? undefined : value
  }

  public testFormatValue(value?: string, data?: { guild?: string | null, guildIcon?: string | null, user?: string | null, userAvatar?: string | null, client?: string | null, clientAvatar?: string | null }) {
    value = this.removeFormatValue(value)

    if (data?.guild) {
      value = value?.replace(/\{\{guild name\}\}/, data.guild)
    }

    if (data?.guildIcon) {
      value = value?.replace(/\{\{guild icon\}\}/, data.guildIcon)
    }

    if (data?.user) {
      value = value?.replace(/\{\{user name\}\}/, data.user)
    }

    if (data?.userAvatar) {
      value = value?.replace(/\{\{user avatar\}\}/, data.userAvatar)
    }

    if (data?.client) {
      value = value?.replace(/\{\{client name\}\}/, data.client)
    }

    if (data?.clientAvatar) {
      value = value?.replace(/\{\{client avatar\}\}/, data.clientAvatar)
    }

    return value
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
        return Colors.tertiaryHex
      } else if (color == 'cyan') {
        return Colors.successHex
      } else if (color == 'red') {
        return Colors.warningHex
      } else if (color == 'embed') {
        return Colors.embedHex
      }
    }

    return undefined
  }

  public formatImage(interaction: Interaction, image?: string) {
    if (image == Options.removeValue) {
      return undefined
    }

    if (image) {
      if (Patterns.url.test(image)) {
        return image
      }

      image = image.toLowerCase()

      if (image == '{{client avatar}}') {
        return Options.clientAvatar
      }

      else if (image == '{{user avatar}}') {
        return undefined
      }

      else if (image == '{{guild icon}}') {
        const guildIcon = interaction.guild?.iconURL()

        if (guildIcon) {
          return guildIcon
        }
      }
    }

    return undefined
  }
}