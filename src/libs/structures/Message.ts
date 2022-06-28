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

  public removeValue = '{{none}}'
  private fieldsLimit = 25

  private editId = (string: string) => string.replaceAll('-', '').replaceAll(' ', '')
  private checkContent = (content: string | undefined): string | undefined => content == this.removeValue ? undefined : content
  private modifyBoolean = (content: string | undefined): boolean => content?.toLowerCase() == 'true' ? true : false

  private modifyImage(image: string | undefined | null): string | undefined {
    if (image && urlRegex.test(image) || image == 'client' || image == 'user' || image == 'server') {
      const clientAvatar = this.client.user?.avatarURL()
      const userAvatar = this.interaction.user.avatarURL()
      const guildIcon = this.interaction.guild?.iconURL()

      if (image == 'client' && clientAvatar) return clientAvatar
      else if (image == 'user' && userAvatar) return userAvatar
      else if (image == 'server' && guildIcon) return guildIcon
      else if (image == this.removeValue) return undefined
      else return image
    }

    return undefined
  }

  private modifyColor(color: string) {
    if (color == 'primary') return colors.Primary
    else if (color == 'secondary') return colors.Secondary
    else if (color == 'tertiary') return colors.Tertiary
    else if (color == 'success') return colors.Success
    else if (color == 'warning') return colors.Warning
    else if (color == 'embed') return colors.Embed
    else if (color == this.removeValue) return undefined
  }

  public get id() {
    return this._id
  }

  public get embed() {
    const embed = new EmbedBuilder()
    const guildId = this.interaction.guild?.id
    const premium = guildId ? this.client.noirPremiums.get(guildId)?.status ?? false : false

    if (this.message.embed.color) embed.setColor(this.message.embed.color)
    if (this.message.embed.author) embed.setAuthor({ name: this.message.embed.author, iconURL: this.message.embed.authorImage })
    if (this.message.embed.description) embed.setDescription(this.message.embed.description)
    if (this.message.embed.thumbnail) embed.setThumbnail(this.message.embed.thumbnail)
    if (this.message.embed.image) embed.setImage(this.message.embed.image)
    if (this.message.embed.footer && premium) embed.setFooter({ text: this.message.embed.footer, iconURL: this.message.embed.footerImage })
    if (this.message.embed.timestamp) embed.setTimestamp()

    if (this.message.embed.fields && premium) {
      this.message.embed.fields.map(field => {
        embed.addFields([field])
      })
    }

    if (this.message.embed.title) {
      embed.setTitle(this.message.embed.title)

      if (this.message.embed.titleURL) embed.setURL(this.message.embed.titleURL)
    }

    if (embed.data.color || embed.data.description || embed.data.title || embed.data.author || embed.data.image || embed.data.thumbnail || embed.data.fields || embed.data.timestamp) {
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
    this.message.content = this.checkContent(content)

    return this
  }

  public setColor(color: string) {
    this.message.embed.colorRaw = this.checkContent(color)
    this.message.embed.color = this.modifyColor(color)

    return this
  }

  public setDescription(description: string) {
    this.message.embed.description = this.checkContent(description)
    this.message.embed.status = true

    return this
  }

  public setTitle(title: string, url?: string) {
    this.message.embed.title = this.checkContent(title)
    this.message.embed.titleURL = this.modifyImage(url)
    this.message.embed.status = true

    return this
  }

  public setAuthor(author: string, image?: string) {
    this.message.embed.author = this.checkContent(author)
    this.message.embed.authorImageRaw = this.checkContent(image)
    this.message.embed.authorImage = this.modifyImage(image)
    this.message.embed.status = true

    return this
  }

  public setImage(image: string) {
    this.message.embed.imageRaw = this.checkContent(image)
    this.message.embed.image = this.modifyImage(image)
    this.message.embed.status = true

    return this
  }

  public setThumbnail(thumbnail: string) {
    this.message.embed.thumbnailRaw = this.checkContent(thumbnail)
    this.message.embed.thumbnail = this.modifyImage(thumbnail)
    this.message.embed.status = true

    return this
  }

  public setFooter(footer: string, icon?: string) {
    this.message.embed.footer = this.checkContent(footer)
    this.message.embed.footerImage = this.modifyImage(icon)
    this.message.embed.footerImageRaw = icon

    return this
  }

  public setTimestamp(status: string): this {
    this.message.embed.timestamp = this.modifyBoolean(status)

    return this
  }

  public addField(field: EmbedField): this {
    if (this.message.embed.fields && this.message.embed.fields?.size >= this.fieldsLimit) {
      return this
    }

    this.message.embed.fields?.set(`${this.editId(field.name)}-${this.editId(field.value)}`, field)
    this.message.embed.status = true

    return this
  }

  public editField(name: string, field: EmbedField): this {
    if (this.message.embed.fields && this.message.embed.fields?.size > 0) {
      this.message.embed.fields.delete(name)
      this.message.embed.fields.set(`${this.editId(field.name)}-${this.editId(field.value)}`, field)
    }

    return this
  }

  public removeField(name: string): this {
    if (this.message.embed.fields && this.message.embed.fields.size > 0) {
      try {
        this.message.embed.fields?.delete(name)
      } catch (err) {
        return this
      }
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