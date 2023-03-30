import Reply from '@helpers/Reply'
import Client from '@structures/Client'
import { AnySelectMenuInteraction, ButtonInteraction, ColorResolvable, CommandInteraction, ContextMenuCommandInteraction, ModalMessageModalSubmitInteraction, ModalSubmitInteraction, time } from 'discord.js'
import Colors from '../constants/Colors'

export default class RateLimit {
  public static limit(client: Client, id: string, time: number): boolean {
    const data = client.rateLimits.get(id)

    if (data) {
      if (data < new Date()) {
        client.rateLimits.delete(id)
        return false
      }

      else {
        return true
      }
    }

    else {
      client.rateLimits.set(id, new Date(Date.now() + (time * 1000)))
      return false
    }
  }

  public static async message(
    properties: {
      client: Client,
      interaction: CommandInteraction | ContextMenuCommandInteraction | ButtonInteraction | ModalSubmitInteraction | ModalMessageModalSubmitInteraction | AnySelectMenuInteraction,
      id: string
      author?: string,
      authorImage?: string,
      description?: string,
      color?: ColorResolvable,
      update?: boolean
    }) {
    const date = properties.client.rateLimits.get(properties.id)

    if (!date) return

    await Reply.reply({
      client: properties.client,
      interaction: properties.interaction,
      color: properties.color ?? Colors.warning,
      author: properties.author ?? 'Rate limited',
      authorImage: properties.authorImage ?? properties.client.user?.displayAvatarURL(),
      description: properties.description ?? `You are being rate limited for ${time(date, 'R')} seconds. Please wait before trying again.`,
      update: properties.update ?? false
    })
  }
}