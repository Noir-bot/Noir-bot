import { ChannelType, Collection, ColorResolvable, EmbedBuilder as DiscordEmbedBuilder, EmbedField, Interaction, TextChannel, Webhook } from 'discord.js'
import Options from '../../../../../constants/Options'
import NoirClient from '../../../../../structures/Client'
import EmbedConstructorUtils from './EmbedConstructorUtils'

export default class EmbedConstructor {
  private _id: string
  private _data: MessageData
  private _webhook?: Webhook

  constructor(id: string) {
    this._id = id
    this._data = {
      embed: {
        status: false,
        timestamp: false,
        fields: new Collection([])
      }
    }
  }

  public get data() {
    return this._data
  }

  public get id() {
    return this._id
  }

  public async webhook(interaction: Interaction): Promise<Webhook | undefined> {
    const channel = interaction.channel as TextChannel

    if (channel?.type != ChannelType.GuildText) return undefined

    if (!this._webhook || !this._webhook.channelId) {
      const webhook = await channel.createWebhook({
        name: `${interaction.guild?.name}`,
        avatar: interaction.guild?.iconURL() ?? Options.clientAvatar
      })

      this._webhook = webhook

      return webhook
    }

    return this._webhook
  }

  public build(client: NoirClient, interaction: Interaction): DiscordEmbedBuilder {
    const embed = new DiscordEmbedBuilder()
    const guildId = interaction.guild?.id
    const premiumStatus = guildId ? client.premium.get(guildId)?.status : false

    if (this.data.embed.timestamp) {
      embed.setTimestamp()
    }

    const embedFields = this.data.embed.fields
    const embedColor = EmbedConstructorUtils.modifyColor(this.data.embed.color)
    const embedDescription = EmbedConstructorUtils.modifyValue(this.data.embed.description)
    const embedAuthor = EmbedConstructorUtils.modifyValue(this.data.embed.author)
    const embedFooter = EmbedConstructorUtils.modifyValue(this.data.embed.footer)
    const embedTitle = EmbedConstructorUtils.modifyValue(this.data.embed.title)
    const embedURL = EmbedConstructorUtils.modifyValue(this.data.embed.url)

    const embedAuthorImage = EmbedConstructorUtils.modifyImage(interaction, this.data.embed.authorImage)
    const embedFooterImage = EmbedConstructorUtils.modifyImage(interaction, this.data.embed.footerImage)
    const embedImage = EmbedConstructorUtils.modifyImage(interaction, this.data.embed.image)
    const embedThumbnail = EmbedConstructorUtils.modifyImage(interaction, this.data.embed.thumbnail)

    if (embedColor) {
      embed.setColor(embedColor as ColorResolvable)
    }

    if (embedDescription) {
      embed.setDescription(embedDescription)
    }

    if (embedAuthor) {
      embed.setAuthor({ name: embedAuthor, iconURL: embedAuthorImage })
    }

    if (embedFooter) {
      embed.setFooter({ text: embedFooter, iconURL: embedFooterImage })
    }

    if (embedTitle) {
      embed.setTitle(embedTitle)
    }

    if (embedURL) {
      embed.setURL(embedURL)
    }

    if (embedImage) {
      embed.setImage(embedImage)
    }

    if (embedThumbnail) {
      embed.setThumbnail(embedThumbnail)
    }

    if (embedFields && premiumStatus) {
      embedFields.map(field => {
        embed.addFields([field])
      })
    }

    return embed
  }

  public setMessage(message: string): this {
    this.data.message = message

    return this
  }

  public setEmbedURL(url: string): this {
    this.data.embed.url = url

    return this
  }

  public setEmbedColor(color: string): this {
    this.data.embed.color = color

    return this
  }

  public setEmbedDescription(description: string): this {
    this.data.embed.description = description
    this.data.embed.status = true

    return this
  }

  public setEmbedTitle(title: string): this {
    this.data.embed.title = title

    return this
  }

  public setEmbedAuthor(author: string, image?: string): this {
    this.data.embed.author = author
    this.data.embed.authorImage = image

    return this
  }

  public setEmbedImage(image: string): this {
    this.data.embed.image = image
    this.data.embed.status = true

    return this
  }

  public setEmbedThumbnail(thumbnail: string): this {
    this._data.embed.thumbnail = thumbnail
    this._data.embed.status = true

    return this
  }

  public setEmbedFooter(footer: string, image?: string): this {
    this.data.embed.footer = footer
    this.data.embed.footerImage = image

    return this
  }

  public setEmbedTimestamp(status: string): this {
    this.data.embed.timestamp = EmbedConstructorUtils.modifyBoolean(status)
    this.data.embed.status = true

    return this
  }

  public addEmbedField(field: MessageEmbedField): this {
    if (this.data.embed.fields?.size < Options.embedFieldsLimit) {
      this.data.embed.fields?.set(field.id, field)
    }

    return this
  }

  public editEmbedField(field: MessageEmbedField): this {
    if (this.data.embed.fields?.size > 0) {
      this.data.embed.fields.delete(field.id)
      this.data.embed.fields.set(field.id, field)
    }

    return this
  }

  public removeEmbedField(id: number): this {
    if (this.data.embed.fields.size > 0) {
      this.data.embed.fields.delete(id)
    }

    return this
  }
}

interface MessageData {
  message?: string
  embed: {
    status: boolean
    url?: string
    color?: string
    footer?: string
    title?: string
    author?: string
    description?: string
    image?: string
    thumbnail?: string
    footerImage?: string
    authorImage?: string
    fields: Collection<number, MessageEmbedField>
    timestamp: boolean
  }
}

interface MessageEmbedField extends EmbedField {
  id: number
}