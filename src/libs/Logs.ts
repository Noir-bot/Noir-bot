import { APIActionRowComponent, APIMessageActionRowComponent, ColorResolvable, EmbedField, JSONEncodable, Message } from 'discord.js'
import NoirClient from '../structures/Client'
import Moderation from '../structures/Moderation'
export default class Logs {
  public client: NoirClient

  constructor(client: NoirClient) {
    this.client = client
  }

  public async log(properties: {
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
    reference?: Message
  }) {
    const moderationData = await Moderation.cache(this.client, properties.guild)

    if (!moderationData || !moderationData.webhook) return

    const webhook = await Moderation.getWebhook(this.client, moderationData.webhook)

    if (!webhook) return

    return await this.client.reply.reply({
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
      reference: properties.reference
    }).catch((err) => { console.log(err) })
  }
}