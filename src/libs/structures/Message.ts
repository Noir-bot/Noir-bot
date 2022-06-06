import { ColorResolvable, EmbedBuilder, EmbedField, Interaction } from 'discord.js'
import { colors } from '../config/design'
import { urlRegex } from '../config/patterns'
import NoirClient from './Client'

export default class NoirMessage {
  public _id: string
  public client: NoirClient
  public interaction: Interaction
  public properties: NoirMessageProperties

  constructor(id: string, client: NoirClient, interaction: Interaction) {
    this._id = id
    this.client = client
    this.interaction = interaction
    this.properties = { embed: { status: false, timestamp: false } }
  }

  public get id() {
    return this._id
  }

  public get content() {
    return this.properties.content
  }

  public get embed() {
    const embed = new EmbedBuilder()
    const clientAvatar = this.client.user?.avatarURL() ? this.client.user.avatarURL() : undefined
    const userAvatar = this.interaction.user.avatarURL()
    const serverIcon = this.interaction.guild?.iconURL() ? this.interaction.guild.iconURL() : undefined

    if (this.properties.embed.color) embed.setColor(this.properties.embed.color)
    if (this.properties.embed.description) embed.setDescription(this.properties.embed.description)
    if (this.properties.embed.author) {
      this.properties.embed.authorImageRaw = this.properties.embed.footerImage

      if (this.properties.embed.authorImage == 'client' && userAvatar) embed.setAuthor({ name: this.properties.embed.author, iconURL: clientAvatar == null ? undefined : userAvatar })
      else if (this.properties.embed.authorImage == 'user' && userAvatar) embed.setAuthor({ name: this.properties.embed.author, iconURL: userAvatar == null ? undefined : userAvatar })
      else if (this.properties.embed.authorImage == 'server' && serverIcon) embed.setAuthor({ name: this.properties.embed.author, iconURL: serverIcon == null ? undefined : serverIcon })
    }
    if (this.properties.embed.footer) {
      this.properties.embed.footerImageRaw = this.properties.embed.footerImage

      if (this.properties.embed.footerImage == 'client' && userAvatar) embed.setFooter({ text: this.properties.embed.footer, iconURL: clientAvatar == null ? undefined : userAvatar })
      else if (this.properties.embed.footerImage == 'user' && userAvatar) embed.setFooter({ text: this.properties.embed.footer, iconURL: userAvatar == null ? undefined : userAvatar })
      else if (this.properties.embed.footerImage == 'server' && serverIcon) embed.setFooter({ text: this.properties.embed.footer, iconURL: serverIcon == null ? undefined : serverIcon })
    }
    if (this.properties.embed.image && urlRegex.test(this.properties.embed.image) || this.properties.embed.image == 'client' || this.properties.embed.image == 'user' || this.properties.embed.image == 'server') {
      this.properties.embed.imageRaw = this.properties.embed.image

      if (this.properties.embed.image == 'client' && clientAvatar) embed.setImage(clientAvatar)
      else if (this.properties.embed.image == 'user' && userAvatar) embed.setImage(userAvatar)
      else if (this.properties.embed.image == 'server' && serverIcon) embed.setImage(serverIcon)
      else embed.setImage(this.properties.embed.image)
    }
    if (this.properties.embed.thumbnail && urlRegex.test(this.properties.embed.thumbnail) || this.properties.embed.thumbnail == 'client' || this.properties.embed.thumbnail == 'user' || this.properties.embed.thumbnail == 'server') {
      this.properties.embed.thumbnailRaw = this.properties.embed.thumbnail

      if (this.properties.embed.thumbnail == 'client' && userAvatar) embed.setThumbnail(userAvatar)
      else if (this.properties.embed.thumbnail == 'user' && userAvatar) embed.setThumbnail(userAvatar)
      else if (this.properties.embed.thumbnail == 'server' && serverIcon) embed.setThumbnail(serverIcon)
      else embed.setThumbnail(this.properties.embed.thumbnail)
    }
    if (this.properties.embed.title) {
      embed.setTitle(this.properties.embed.title)
      if (this.properties.embed.titleURL) embed.setURL(this.properties.embed.titleURL)
    }

    if (this.properties.embed?.fields) {
      embed.addFields(this.properties.embed?.fields)
    }

    if (this.properties.embed?.title || this.properties.embed?.author || this.properties.embed?.description || this.properties.embed?.fields) {
      this.properties.embed.status = true
    }

    return embed
  }

  public get embedStatus() {
    return this.properties.embed.status
  }

  public get color() {
    return this.properties.embed.colorRaw
  }

  public get image() {
    return this.properties.embed.imageRaw
  }

  public get thumbnail() {
    return this.properties.embed.thumbnailRaw
  }

  public get authorImage() {
    return this.properties.embed.authorImageRaw
  }

  public get footerImage() {
    return this.properties.embed.footerImageRaw
  }

  public setContent(content: string) {
    this.properties.content = content

    return this
  }

  public setColor(color: string) {
    this.properties.embed.colorRaw = color

    if (color == 'primary') this.properties.embed.color = colors.Primary
    else if (color == 'secondary') this.properties.embed.color = colors.Secondary
    else if (color == 'tertiary') this.properties.embed.color = colors.Tertiary
    else if (color == 'success') this.properties.embed.color = colors.Success
    else if (color == 'warning') this.properties.embed.color = colors.Warning
    else if (color == 'embed') this.properties.embed.color = colors.Embed

    return this
  }

  public setTitle(title: string, url?: string) {
    this.properties.embed.title = title

    if (url && urlRegex.test(url)) {
      this.properties.embed.titleURL = url
    }

    return this
  }

  public setAuthor(author: string, image?: string) {
    this.properties.embed.author = author

    if (image && urlRegex.test(image)) {
      this.properties.embed.authorImage = image
    }

    return this
  }

  public setDescription(description: string) {
    this.properties.embed.description = description
  }

  public setFooter(footer: string, image?: string) {
    this.properties.embed.footer = footer

    if (image && urlRegex.test(image)) {
      this.properties.embed.footerImage = image
    }

    return this
  }

  public setImage(image: string) {
    if (urlRegex.test(image) || image == 'client' || image == 'user' || image == 'server') {
      this.properties.embed.image = image
    }

    return this
  }

  public setThumbnail(thumbnail: string) {
    if (urlRegex.test(thumbnail) || thumbnail == 'client' || thumbnail == 'user' || thumbnail == 'server') {
      this.properties.embed.thumbnail = thumbnail
    }

    return this
  }

  public addField(field: EmbedField) {
    this.properties.embed.fields?.push(field)

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
    fields?: EmbedField[]
    timestamp: boolean
  }
}