import { Collection, ColorResolvable, EmbedBuilder, EmbedField, Interaction } from 'discord.js'
import { colors } from '../config/design'
import { urlRegex } from '../config/patterns'
import NoirClient from './Client'

export default class NoirMessage {
  private _id: string
  private client: NoirClient
  private interaction: Interaction
  private message: NoirMessageProperties

  constructor(id: string, client: NoirClient, interaction: Interaction) {
    this._id = id
    this.client = client
    this.interaction = interaction
    this.message = { embed: { status: false, timestamp: false, fields: new Collection([]) } }
  }

  private checkImage(image: string | undefined | null): string | undefined {
    if (image && urlRegex.test(image) || image == 'client' || image == 'user' || image == 'server') {
      const clientAvatar = this.client.user?.avatarURL()
      const userAvatar = this.interaction.user.avatarURL()
      const guildIcon = this.interaction.guild?.iconURL()

      if (image == 'client' && clientAvatar) return clientAvatar
      else if (image == 'user' && userAvatar) return userAvatar
      else if (image == 'server' && guildIcon) return guildIcon
      else if (image == 'none') return undefined
      else return image
    }

    return
  }

  private editId(string: string) {
    return string.replaceAll('-', '').replaceAll(' ', '')
  }

  public get id() {
    return this._id
  }

  public get embed() {
    const embed = new EmbedBuilder()

    if (this.message.embed.description) embed.setDescription(this.message.embed.description)
    if (this.message.embed.thumbnail) embed.setThumbnail(this.message.embed.thumbnail)
    if (this.message.embed.image) embed.setImage(this.message.embed.image)
    if (this.message.embed.color) embed.setColor(this.message.embed.color)
    if (this.message.embed.timestamp) embed.setTimestamp()

    if (this.message.embed.fields) {
      this.message.embed.fields.map(field => {
        embed.addFields([field])
      })
    }

    if (this.message.embed.author) embed.setAuthor({ name: this.message.embed.author, iconURL: this.message.embed.authorImage })
    if (this.message.embed.footer) embed.setFooter({ text: this.message.embed.footer, iconURL: this.message.embed.footerImage })

    if (this.message.embed.title) {
      embed.setTitle(this.message.embed.title)

      if (this.message.embed.titleURL) embed.setURL(this.message.embed.titleURL)
    }

    if (embed.data.color || embed.data.description || embed.data.title || embed.data.author || embed.data.image || embed.data.thumbnail || embed.data.fields) {
      this.message.embed.status = true
    }

    return embed
  }

  public get status() {
    return this.message.embed.status
  }

  public get content() {
    return this.message.content
  }

  public get color() {
    return this.message.embed.colorRaw
  }

  public get description() {
    return this.message.embed.description
  }

  public get title() {
    return { text: this.message.embed.title, url: this.message.embed.titleURL }
  }

  public get url() {
    return this.message.embed.titleURL
  }

  public get author() {
    return { text: this.message.embed.author, image: this.message.embed.authorImageRaw }
  }

  public get image() {
    return this.message.embed.imageRaw
  }

  public get thumbnail() {
    return this.message.embed.thumbnailRaw
  }

  public get footer() {
    return { text: this.message.embed.footer, image: this.message.embed.footerImageRaw }
  }

  public get timestamp() {
    return this.message.embed.timestamp
  }

  public get fields() {
    return this.message.embed.fields
  }

  public setContent(content: string) {
    this.message.content = content

    return this
  }

  public setColor(color: string) {
    this.message.embed.colorRaw = color

    if (color == 'primary') this.message.embed.color = colors.Primary
    else if (color == 'secondary') this.message.embed.color = colors.Secondary
    else if (color == 'tertiary') this.message.embed.color = colors.Tertiary
    else if (color == 'success') this.message.embed.color = colors.Success
    else if (color == 'warning') this.message.embed.color = colors.Warning
    else if (color == 'embed') this.message.embed.color = colors.Embed

    return this
  }

  public setDescription(description: string) {
    this.message.embed.description = description
    this.message.embed.status = true
  }

  public setTitle(title: string, url?: string) {
    this.message.embed.title = title
    this.message.embed.status = true

    if (url && urlRegex.test(url)) {
      this.message.embed.titleURL = url
    }

    return this
  }

  public setAuthor(author: string, image?: string) {
    this.message.embed.author = author
    this.message.embed.status = true
    this.message.embed.authorImageRaw = image
    this.message.embed.authorImage = this.checkImage(image)

    return this
  }

  public setImage(image: string) {
    this.message.embed.status = true
    this.message.embed.imageRaw = image
    this.message.embed.image = this.checkImage(image)

    return this
  }

  public setThumbnail(thumbnail: string) {
    this.message.embed.status = true
    this.message.embed.thumbnailRaw = thumbnail
    this.message.embed.thumbnail = this.checkImage(thumbnail)

    return this
  }

  public setFooter(footer: string, icon?: string) {
    this.message.embed.footer = footer
    this.message.embed.footerImageRaw = icon
    this.message.embed.footerImage = this.checkImage(icon)

    return this
  }

  public setTimestamp(status: boolean): this {
    this.message.embed.timestamp = status

    return this
  }

  public addField(field: EmbedField): this {
    if (this.message.embed.fields && this.message.embed.fields?.size >= 25) {
      return this
    }

    this.message.embed.fields?.set(`${this.editId(field.name)}-${this.editId(field.value)}`, field)
    this.message.embed.status = true

    console.log(this.message.embed.fields)

    return this
  }

  public editField(name: string, field: EmbedField): this {
    if (this.message.embed.fields && this.message.embed.fields?.size > 0) {
      console.log(name)
      this.message.embed.fields.delete(name)
      this.message.embed.fields.set(`${this.editId(field.name)}-${this.editId(field.value)}`, field)
    }

    return this
  }

  public removeField(name: string): this {
    try {
      this.message.embed.fields?.delete(name)
    } catch (err) {
      return this
    }

    return this
  }
}

interface NoirMessageProperties {
  content?: string
  embed: {
    status: boolean
    description?: string
    color?: ColorResolvable
    colorRaw?: string
    title?: string
    titleURL?: string
    author?: string
    authorImage?: string
    authorImageRaw?: string
    footer?: string
    footerImage?: string
    footerImageRaw?: string
    image?: string
    imageRaw?: string
    thumbnail?: string
    thumbnailRaw?: string
    fields?: Collection<string, EmbedField>
    timestamp: boolean
  }
}