import { ColorResolvable, EmbedBuilder, EmbedField } from 'discord.js'
import { colors } from '../config/design'
import { urlRegex } from '../config/patterns'

export default class NoirMessage {
  public _id: string
  public properties: NoirMessageProperties

  constructor(id: string) {
    this._id = id
    this.properties = { embed: { status: false } }
  }

  public get id() {
    return this._id
  }

  public get content() {
    return this.properties.content
  }

  public get embed() {
    const embed = new EmbedBuilder()

    if (this.properties.embed.color) embed.setColor(this.properties.embed.color)
    if (this.properties.embed.description) embed.setDescription(this.properties.embed.description)
    if (this.properties.embed.author) embed.setAuthor({ name: this.properties.embed.author, iconURL: this.properties.embed.authorImage })
    if (this.properties.embed.footer) embed.setFooter({ text: this.properties.embed.footer, iconURL: this.properties.embed.footerImage })
    if (this.properties.embed.image && urlRegex.test(this.properties.embed.image)) embed.setImage(this.properties.embed.image)
    if (this.properties.embed.thumbnail && urlRegex.test(this.properties.embed.thumbnail)) embed.setThumbnail(this.properties.embed.thumbnail)
    if (this.properties.embed.title) {
      embed.setTitle(this.properties.embed.title)
      if (this.properties.embed.titleURL) embed.setURL(this.properties.embed.titleURL)
    }

    if (this.properties.embed?.fields) {
      embed.addFields(this.properties.embed?.fields)
    }

    if (this.properties?.content || this.properties.embed?.title || this.properties.embed?.author || this.properties.embed?.description || this.properties.embed?.fields) {
      this.properties.embed.status = true
    }

    return embed
  }

  public setContent(content: string) {
    this.properties.content = content

    return this
  }

  public setColor(color: colors) {
    this.properties.embed.color = color

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
    if (urlRegex.test(image)) {
      this.properties.embed.image = image
    }

    return this
  }

  public setThumbnail(thumbnail: string) {
    if (urlRegex.test(thumbnail)) {
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
    color?: ColorResolvable
    title?: string
    titleURL?: string
    author?: string
    authorImage?: string
    description?: string
    footer?: string
    footerImage?: string
    image?: string
    thumbnail?: string
    fields?: EmbedField[]
  }
}