import Colors from '@constants/Colors'
import Client from '@structures/Client'
import Preferences from '../../constants/Preferences'

export default class WelcomeMessage {
  public type: WelcomeMessageType
  public guild: string
  public status: boolean
  public message?: string
  public url?: string
  public color?: string
  public rawColor?: string
  public title?: string
  public author?: string
  public footer?: string
  public authorImage?: string
  public rawAuthorImage?: string
  public footerImage?: string
  public rawFooterImage?: string
  public description?: string
  public thumbnail?: string
  public rawThumbnail?: string
  public image?: string
  public rawImage?: string
  public fieldsId: number[]
  public fieldsName: string[]
  public fieldsValue: string[]
  public fieldsInline: boolean[]
  public timestamp: boolean

  constructor(guild: string, type: WelcomeMessageType, options: WelcomeMessageOptions) {
    this.type = type
    this.guild = guild
    this.status = options.status || false
    this.fieldsId = options.fieldsId || []
    this.fieldsName = options.fieldsName || []
    this.fieldsValue = options.fieldsValue || []
    this.fieldsInline = options.fieldsInline || []
    this.timestamp = options.timestamp || false
    this.message = options?.message
    this.url = options?.url
    this.color = options?.color
    this.rawColor = options?.rawColor
    this.title = options?.title
    this.author = options?.author
    this.footer = options?.footer
    this.authorImage = options?.authorImage
    this.rawAuthorImage = options?.rawAuthorImage
    this.footerImage = options?.footerImage
    this.rawFooterImage = options?.rawFooterImage
    this.description = options?.description
    this.thumbnail = options?.thumbnail
    this.rawThumbnail = options?.rawThumbnail
    this.image = options?.image
    this.rawImage = options?.rawImage
  }

  public static formatRemove(input: string) {
    return input.trim().toLowerCase() == Preferences.removeValue ? '' : input
  }

  public static formatColor(input: string) {
    input = input.trim().toLowerCase()

    switch (input) {
      case 'blue':
        return '#254ee6'
      case 'cyan':
        return '#37e3e6'
      case 'lightblue':
        return '#2a9dfa'
      case 'lime':
        return '#68e620'
      case 'green':
        return '#42f01f'
      case 'red':
        return '#f72525'
      case 'coral':
        return '#fc3a30'
      case 'orange':
        return '#f05316'
      case 'yellow':
        return '#e6c327'
      case 'gray':
        return '#3e4247'
      case 'noir':
        return '#141414'
      case 'embed':
        return Colors.embedHex
      default:
        return undefined
    }
  }

  public static formatImage(input?: string, options?: { guild?: string | null, user?: string | null, client?: string | null }) {
    let result: string | undefined | null = undefined
    input = input?.trim()

    if (options?.guild?.match(/\{\{remove\}\}/)) {
      result = undefined
    }

    else if (options?.guild && input?.match(/\{\{server icon\}\}/g)) {
      result = input?.replace(/\{\{server icon\}\}/g, options.guild)
    }

    else if (options?.user && input?.match(/\{\{user avatar\}\}/g)) {
      result = input?.replace(/\{\{user avatar\}\}/g, options.user)
    }

    else if (options?.client && input?.match(/\{\{bot avatar\}\}/g)) {
      result = input?.replace(/\{\{bot avatar\}\}/g, options.client)
    }

    else if (input?.startsWith('http://') || input?.startsWith('https://')) {
      result = input
    }

    return result
  }

  public static formatVariable(input?: string, options?: { guild?: { name?: string, icon?: string | null, members?: number, createdAt?: string | null, created?: string | null }, user?: { name?: string, avatar?: string | null, createdAt?: string | null, created?: string | null, joinedAt?: string | null, joined?: string | null }, client?: { name?: string, avatar?: string | null } }) {
    input = input?.trim()

    if (input?.trim().toLowerCase() == Preferences.removeValue) {
      input = undefined
    }

    if (options?.guild?.name) {
      input = input?.replace(/\{\{server name\}\}/g, options.guild.name)
    }

    if (options?.guild?.members) {
      input = input?.replace(/\{\{server members\}\}/g, options.guild.members.toString())
    }

    if (options?.guild?.icon) {
      input = input?.replace(/\{\{server icon\}\}/g, options.guild.icon)
    }

    if (options?.guild?.createdAt) {
      input = input?.replace(/\{\{server created at\}\}/g, options.guild.createdAt)
    }

    if (options?.guild?.created) {
      input = input?.replace(/\{\{server created\}\}/g, options.guild.created)
    }

    if (options?.user?.avatar) {
      input = input?.replace(/\{\{user avatar\}\}/g, options.user.avatar)
    }

    if (options?.user?.created) {
      input = input?.replace(/\{\{user created\}\}/g, options.user.created)
    }

    if (options?.user?.createdAt) {
      input = input?.replace(/\{\{user created at\}\}/g, options.user.createdAt)
    }

    if (options?.user?.joined) {
      input = input?.replace(/\{\{user joined\}\}/g, options.user.joined)
    }

    if (options?.user?.joinedAt) {
      input = input?.replace(/\{\{user joined at\}\}/g, options.user.joinedAt)
    }

    if (options?.user?.name) {
      input = input?.replace(/\{\{user name\}\}/g, options.user.name)
    }

    if (options?.client?.name) {
      input = input?.replace(/\{\{bot name\}\}/g, options.client.name)
    }

    if (options?.client?.avatar) {
      input = input?.replace(/\{\{bot avatar\}\}/g, options.client.avatar)
    }

    return input
  }

  public static async cache(client: Client, guildId: string, type: WelcomeMessageType, restore?: boolean, cached?: boolean) {
    const cache = client.welcomeMessages.get((cached ? '(cached)' : '') + `${guildId}${type}`)

    if (!cache || restore) {
      let data = await client.prisma.welcomeMessage.findFirst({ where: { guild: guildId, type: type } })

      if (!data) {
        data = await client.prisma.welcomeMessage.create({ data: { guild: guildId, type: type, status: false } })
      }

      client.welcomeMessages.set((cached ? '(cached)' : '') + `${guildId}${type}`, new WelcomeMessage(guildId, type, {
        status: data.status,
        fieldsId: data.fieldsId,
        fieldsInline: data.fieldsInline,
        fieldsName: data.fieldsName,
        fieldsValue: data.fieldsValue,
        timestamp: data.timestamp,
        author: data.author as string | undefined,
        authorImage: data.authorImage as string | undefined,
        color: data.color as string | undefined,
        description: data.description as string | undefined,
        footer: data.footer as string | undefined,
        footerImage: data.footerImage as string | undefined,
        image: data.image as string | undefined,
        message: data.message as string | undefined,
        rawAuthorImage: data.rawAuthorImage as string | undefined,
        rawColor: data.rawColor as string | undefined,
        rawFooterImage: data.rawFooterImage as string | undefined,
        rawImage: data.rawImage as string | undefined,
        title: data.title as string | undefined,
        url: data.url as string | undefined,
        rawThumbnail: data.rawThumbnail as string | undefined,
        thumbnail: data.thumbnail as string | undefined
      }))

      return client.welcomeMessages.get((cached ? '(cached)' : '') + `${guildId}${type}`)!
    }

    return cache!
  }

  public static async save(client: Client, guildId: string, type: WelcomeMessageType) {
    const cache = client.welcomeMessages.get('(cached)' + `${guildId}${type}`)

    if (cache) {
      const data = await client.prisma.welcomeMessage.findFirst({ where: { guild: guildId, type: type } })

      if (!data) {
        await client.prisma.welcomeMessage.create({ data: { guild: guildId, type: type, status: false } })
      }

      else {
        await client.prisma.welcomeMessage.updateMany({
          where: { guild: cache.guild, type: cache.type },
          data: cache
        })
      }
    }

    return cache
  }
}

export type WelcomeMessageType = 'guild_join' | 'guild_left' | 'direct_join'

export interface WelcomeMessageOptions {
  status: boolean
  fieldsId: number[]
  fieldsName: string[]
  fieldsValue: string[]
  fieldsInline: boolean[]
  timestamp: boolean
  message?: string
  url?: string
  color?: string
  rawColor?: string
  title?: string
  author?: string
  footer?: string
  authorImage?: string
  rawAuthorImage?: string
  footerImage?: string
  rawFooterImage?: string
  description?: string
  thumbnail?: string
  rawThumbnail?: string
  image?: string
  rawImage?: string
}

export interface WelcomeMessageField {
  id: number
  name: string
  value: string
  inline: boolean
}