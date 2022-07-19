import { Interaction } from 'discord.js'
import Colors from '../../../../../constants/Colors'
import Options from '../../../../../constants/Options'
import Patterns from '../../../../../constants/Patterns'

export default class EmbedConstructorUtils {
  public static modifyValue(value?: string): string | undefined {
    return value == Options.removeValue ? undefined : value
  }

  public static modifyImage(interaction: Interaction, image?: string): string | undefined {
    if (image) {
      if (Patterns.url.test(image)) {
        return image
      }

      image = image.toLowerCase()

      if (image == 'client') {
        return Options.clientAvatar
      }

      else if (image == 'server') {
        const guildIcon = interaction.guild?.iconURL()

        if (guildIcon) {
          return guildIcon
        }
      }

      else if (image == 'user') {
        const userAvatar = interaction.user.avatarURL()

        if (userAvatar) {
          return userAvatar
        }
      }
    }

    return undefined
  }

  public static modifyColor(color?: string): string | undefined {
    if (color) {
      if (Patterns.color.test(color)) {
        return color
      }

      color = color.toLowerCase()

      if (color == 'green') {
        return Colors.primaryHex
      }

      else if (color == 'gray') {
        return Colors.secondaryHex
      }

      else if (color == 'yellow') {
        return Colors.tertiaryHex
      }

      else if (color == 'cyan') {
        return Colors.successHex
      }

      else if (color == 'red') {
        return Colors.warningHex
      }

      else if (color == 'embed') {
        return Colors.embedHex
      }
    }

    return undefined
  }

  public static modifyBoolean(boolean?: string): boolean {
    return boolean?.toLowerCase() == 'true' ? true : false
  }
}