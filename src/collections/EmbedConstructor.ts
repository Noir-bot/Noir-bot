import { Collection, ColorResolvable, EmbedBuilder, EmbedField, Interaction } from 'discord.js'
import Colors from '../constants/Colors'
import Patterns from '../constants/Patterns'
import NoirClient from '../structures/Client'

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

export default class MessageConstructor {
  private _id: string
  private _data: MessageData

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

  public removeValue = '{{none}}'
  private embedFieldsLimit = 25

  private modifyValue(value?: string): string | undefined {
    return value == this.removeValue ? undefined : value
  }

  private modifyImage(client: NoirClient, interaction: Interaction, image?: string): string | undefined {
    if (image) {
      if (Patterns.url.test(image)) {
        return image
      }

      else if (image.toLowerCase() == 'client') {
        const clientAvatar = client.user?.avatarURL()

        if (clientAvatar) {
          return clientAvatar
        }
      }

      else if (image.toLowerCase() == 'user') {
        const userAvatar = interaction.user.avatarURL()

        if (userAvatar) {
          return userAvatar
        }
      }

      else if (image.toLowerCase() == 'server') {
        const guildIcon = interaction.guild?.iconURL()

        if (guildIcon) {
          return guildIcon
        }
      }
    }

    return undefined
  }

  private modifyColor(color?: string): string | undefined {
    if (color) {
      if (Patterns.color.test(color)) {
        return color
      }

      else if (color == 'primary') {
        return Colors.primaryHex
      }

      else if (color == 'secondary') {
        return Colors.secondaryHex
      }

      else if (color == 'tertiary') {
        return Colors.tertiaryHex
      }

      else if (color == 'success') {
        return Colors.successHex
      }

      else if (color == 'warning') {
        return Colors.warningHex
      }

      else if (color == 'embed') {
        return Colors.embedHex
      }
    }

    return undefined
  }

  private modifyBoolean(boolean?: string): boolean {
    return boolean?.toLowerCase() == 'true' ? true : false
  }

  public buildEmbed(client: NoirClient, interaction: Interaction): EmbedBuilder {
    const embed = new EmbedBuilder()
    const guildId = interaction.guild?.id
    const premium = guildId ? client.premium.get(guildId)?.status ?? false : false

    const embedURL = this.modifyValue(this.embedURL)
    const embedColor = this.modifyColor(this.embedColor)
    const embedDescription = this.modifyValue(this.embedDescription)
    const embedTitle = this.modifyValue(this.embedTitle)
    const embedAuthor = this.modifyValue(this.embedAuthor.text)
    const embedFooter = this.modifyValue(this.embedFooter.text)

    const embedImage = this.modifyImage(client, interaction, this.embedImage)
    const embedThumbnail = this.modifyImage(client, interaction, this.embedThumbnail)
    const embedAuthorImage = this.modifyImage(client, interaction, this.embedAuthor.text)
    const embedFooterImage = this.modifyImage(client, interaction, this.embedFooter.image)

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

    if (embedImage) {
      embed.setImage(embedImage)
    }

    if (embedThumbnail) {
      embed.setThumbnail(embedThumbnail)
    }

    if (embedTitle) {
      embed.setTitle(embedTitle)
    }

    if (this.embedFields && premium) {
      this.embedFields.map(field => {
        embed.addFields([field])
      })
    }

    if (embedURL) {
      embed.setURL(embedURL)
    }


    if (this.embedTimestamp) {
      embed.setTimestamp()
    }

    return embed
  }

  public get id(): string {
    return this._id
  }

  public get embedStatus(): boolean {
    return this._data.embed.status
  }

  public get message(): string | undefined {
    return this._data.message
  }

  public get embedURL(): string | undefined {
    return this._data.embed.url
  }

  public get embedColor(): string | undefined {
    return this._data.embed.color
  }

  public get embedDescription(): string | undefined {
    return this._data.embed.description
  }

  public get embedTitle(): string | undefined {
    return this._data.embed.title
  }

  public get embedAuthor(): { text: string | undefined, image: string | undefined } {
    return {
      text: this._data.embed.author,
      image: this._data.embed.authorImage
    }
  }

  public get embedFooter(): { text: string | undefined, image: string | undefined } {
    return {
      text: this._data.embed.footer,
      image: this._data.embed.footerImage
    }
  }

  public get embedImage(): string | undefined {
    return this._data.embed.image
  }

  public get embedThumbnail(): string | undefined {
    return this._data.embed.thumbnail
  }

  public get embedFields(): Collection<number, MessageEmbedField> {
    return this._data.embed.fields
  }

  public get embedTimestamp(): boolean {
    return this._data.embed.timestamp
  }

  public setMessage(message: string): this {
    this._data.message = message

    return this
  }

  public setEmbedURL(url: string): this {
    this._data.embed.url = url

    return this
  }

  public setEmbedColor(color: string): this {
    this._data.embed.color = color
    this._data.embed.status = true

    return this
  }

  public setEmbedDescription(description: string): this {
    this._data.embed.description = description
    this._data.embed.status = true

    return this
  }

  public setEmbedTitle(title: string): this {
    this._data.embed.title = title

    return this
  }

  public setEmbedAuthor(author: string, image?: string): this {
    this._data.embed.author = author
    this._data.embed.authorImage = image

    return this
  }

  public setEmbedImage(image: string): this {
    this._data.embed.image = image
    this._data.embed.status = true

    return this
  }

  public setEmbedThumbnail(thumbnail: string): this {
    this._data.embed.thumbnail = thumbnail
    this._data.embed.status = true

    return this
  }

  public setEmbedFooter(footer: string, image?: string): this {
    this._data.embed.footer = footer
    this._data.embed.footerImage = image

    return this
  }

  public setEmbedTimestamp(status: string): this {
    this._data.embed.timestamp = this.modifyBoolean(status)
    this._data.embed.status = true

    return this
  }

  public addEmbedField(field: MessageEmbedField): this {
    if (this._data.embed.fields?.size < this.embedFieldsLimit) {
      this._data.embed.fields?.set(field.id, field)
    }

    return this
  }

  public editEmbedField(field: MessageEmbedField): this {
    if (this._data.embed.fields?.size > 0) {
      this._data.embed.fields.delete(field.id)
      this._data.embed.fields.set(field.id, field)
    }

    return this
  }

  public removeEmbedField(id: number): this {
    if (this._data.embed.fields.size > 0) {
      this._data.embed.fields.delete(id)
    }

    return this
  }
}