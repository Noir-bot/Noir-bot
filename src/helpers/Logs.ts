import Reply from '@helpers/Reply'
import Client from '@structures/Client'
import Moderation from '@structures/moderation/Moderation'
import { APIActionRowComponent, APIMessageActionRowComponent, ColorResolvable, EmbedField, JSONEncodable, Message } from 'discord.js'

export default class Logs {
  public static async log(
    properties: {
      client: Client,
      guild: string,
      components?: (APIActionRowComponent<APIMessageActionRowComponent> | JSONEncodable<APIActionRowComponent<APIMessageActionRowComponent>>)[],
      title?: string,
      url?: string,
      author?: string,
      authorImage?: string,
      description?: string,
      color?: ColorResolvable,
      fields?: EmbedField[],
      footer?: string,
      footerImage?: string,
      thumbnail?: string,
      image?: string,
      content?: string,
      reference?: Message,
      referenceId?: string
    }) {
    const moderationData = await Moderation.cache(properties.client, properties.guild, false, true)

    if (!moderationData || !moderationData.webhook) return

    const webhook = await Moderation.getWebhook(properties.client, moderationData.webhook)

    if (!webhook) return

    let message = properties.reference

    if (properties.referenceId) {
      message = webhook.channel?.messages.cache.get(properties.referenceId) ?? await webhook.channel?.messages.fetch(properties.referenceId)
    }

    return await Reply.sendWebhook({
      client: properties.client,
      webhook: webhook,
      content: properties.content,
      components: properties.components,
      title: properties.title,
      url: properties.url,
      author: properties.author,
      authorImage: properties.authorImage,
      description: properties.description,
      color: properties.color,
      fields: properties.fields,
      footer: properties.footer,
      footerImage: properties.footerImage,
      thumbnail: properties.thumbnail,
      image: properties.image,
      reference: message
    }).catch((err) => { console.log(err) })
  }
}