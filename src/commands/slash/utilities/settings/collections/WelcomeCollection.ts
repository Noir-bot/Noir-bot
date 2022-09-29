import { parseWebhookURL } from 'discord.js'
import NoirClient from '../../../../../structures/Client'

export default class WelcomeCollection {
  private readonly _id: string
  private _data: WelcomeCollectionData

  constructor(id: string) {
    this._id = id
    this._data = {
      guild: id,
      status: false,
      restoreRoles: false,
      rawWebhookAvatar: undefined,
      webhook: undefined,
      roles: [],
      messages: {
        guild: {
          status: false,
          join: {
            embed: {
              fields: [],
              timestamp: false
            },
          },
          left: {
            embed: {
              fields: [],
              timestamp: false
            },
          }
        },
        direct: {
          status: false,
          join: {
            embed: {
              fields: [],
              timestamp: false
            },
          }
        }
      }
    }
  }

  public get id() {
    return this._id
  }

  public get data() {
    return this._data
  }

  public async saveData(client: NoirClient) {
    let welcomeData = await client.prisma.welcome.findFirst({
      where: { guild: this.id }
    })

    if (!welcomeData) {
      welcomeData = await client.prisma.welcome.create({ data: this.data })
    }

    welcomeData = await client.prisma.welcome.update({
      where: { guild: this.id },
      data: this.data
    })
  }

  public async cacheData(client: NoirClient) {
    let welcomeData = await client.prisma.welcome.findFirst({
      where: { guild: this.id }
    })

    if (!welcomeData) {
      welcomeData = await client.prisma.welcome.create({ data: this.data })
    }

    this._data = {
      guild: welcomeData.guild,
      status: welcomeData.status,
      restoreRoles: welcomeData.restoreRoles,
      roles: welcomeData.roles,
      rawWebhookAvatar: welcomeData.rawWebhookAvatar ?? undefined,
      webhook: welcomeData.webhook ?? undefined,
      messages: {
        guild: {
          status: welcomeData.messages.guild.status ?? false,
          join: {
            message: welcomeData.messages.guild.join.message ?? undefined,
            embed: {
              url: welcomeData.messages.guild.join?.embed.url ?? undefined,
              color: welcomeData.messages.guild.join?.embed.color ?? undefined,
              rawColor: welcomeData.messages.guild.join?.embed.rawColor ?? undefined,
              title: welcomeData.messages.guild.join?.embed.title ?? undefined,
              author: welcomeData.messages.guild.join?.embed.author ?? undefined,
              footer: welcomeData.messages.guild.join?.embed.footer ?? undefined,
              authorImage: welcomeData.messages.guild.join?.embed.authorImage ?? undefined,
              rawAuthorImage: welcomeData.messages.guild.join?.embed.rawAuthorImage ?? undefined,
              footerImage: welcomeData.messages.guild.join?.embed.footerImage ?? undefined,
              rawFooterImage: welcomeData.messages.guild.join?.embed.rawFooterImage ?? undefined,
              description: welcomeData.messages.guild.join?.embed.description ?? undefined,
              thumbnail: welcomeData.messages.guild.join?.embed.thumbnail ?? undefined,
              rawThumbnail: welcomeData.messages.guild.join?.embed.rawThumbnail ?? undefined,
              image: welcomeData.messages.guild.join?.embed.image ?? undefined,
              rawImage: welcomeData.messages.guild.join?.embed.rawImage ?? undefined,
              timestamp: welcomeData.messages.guild.join?.embed.timestamp ?? false,
              fields: welcomeData.messages.guild.join?.embed.fields ?? []
            }
          },
          left: {
            message: welcomeData.messages.guild.left.message ?? undefined,
            embed: {
              url: welcomeData.messages.guild.left?.embed.url ?? undefined,
              color: welcomeData.messages.guild.left?.embed.color ?? undefined,
              rawColor: welcomeData.messages.guild.left?.embed.rawColor ?? undefined,
              title: welcomeData.messages.guild.left?.embed.title ?? undefined,
              author: welcomeData.messages.guild.left?.embed.author ?? undefined,
              footer: welcomeData.messages.guild.left?.embed.footer ?? undefined,
              authorImage: welcomeData.messages.guild.left?.embed.authorImage ?? undefined,
              rawAuthorImage: welcomeData.messages.guild.left?.embed.rawAuthorImage ?? undefined,
              footerImage: welcomeData.messages.guild.left?.embed.footerImage ?? undefined,
              rawFooterImage: welcomeData.messages.guild.left?.embed.rawFooterImage ?? undefined,
              description: welcomeData.messages.guild.left?.embed.description ?? undefined,
              thumbnail: welcomeData.messages.guild.left?.embed.thumbnail ?? undefined,
              rawThumbnail: welcomeData.messages.guild.left?.embed.rawThumbnail ?? undefined,
              image: welcomeData.messages.guild.left?.embed.image ?? undefined,
              rawImage: welcomeData.messages.guild.left?.embed.rawImage ?? undefined,
              timestamp: welcomeData.messages.guild.left?.embed.timestamp ?? false,
              fields: welcomeData.messages.guild.left?.embed.fields ?? []
            }
          }
        },
        direct: {
          status: welcomeData.messages.direct.status ?? false,
          join: {
            message: welcomeData.messages.direct.join?.message ?? undefined,
            embed: {
              url: welcomeData.messages.direct.join?.embed.url ?? undefined,
              color: welcomeData.messages.direct.join?.embed.color ?? undefined,
              rawColor: welcomeData.messages.direct.join?.embed.rawColor ?? undefined,
              title: welcomeData.messages.direct.join?.embed.title ?? undefined,
              author: welcomeData.messages.direct.join?.embed.author ?? undefined,
              footer: welcomeData.messages.direct.join?.embed.footer ?? undefined,
              authorImage: welcomeData.messages.direct.join?.embed.authorImage ?? undefined,
              rawAuthorImage: welcomeData.messages.direct.join?.embed.rawAuthorImage ?? undefined,
              footerImage: welcomeData.messages.direct.join?.embed.footerImage ?? undefined,
              rawFooterImage: welcomeData.messages.direct.join?.embed.rawFooterImage ?? undefined,
              description: welcomeData.messages.direct.join?.embed.description ?? undefined,
              thumbnail: welcomeData.messages.direct.join?.embed.thumbnail ?? undefined,
              rawThumbnail: welcomeData.messages.direct.join?.embed.rawThumbnail ?? undefined,
              image: welcomeData.messages.direct.join?.embed.image ?? undefined,
              rawImage: welcomeData.messages.direct.join?.embed.rawImage ?? undefined,
              timestamp: welcomeData.messages.direct.join?.embed.timestamp ?? false,
              fields: welcomeData.messages.direct.join?.embed.fields ?? []
            }
          }
        }
      }
    }
  }

  public async getWebhook(client: NoirClient) {
    const welcomeData = client.welcomeSettings.get(this.id)

    if (!welcomeData || !welcomeData.data.webhook) return undefined
    const webhookData = parseWebhookURL(welcomeData.data.webhook)

    if (!webhookData) return undefined
    const webhook = await client.fetchWebhook(webhookData?.id, webhookData?.token)

    return webhook
  }
}

interface WelcomeCollectionData {
  guild: string
  status: boolean
  restoreRoles: boolean
  roles: string[]
  rawWebhookAvatar?: string
  webhook?: string
  messages: {
    guild: {
      status: boolean,
      join: {
        message?: string
        embed: {
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
          fields: Array<{
            id: number
            name: string
            value: string
            inline: boolean
          }>
          timestamp: boolean
        }
      },
      left: {
        message?: string
        embed: {
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
          fields: Array<{
            id: number
            name: string
            value: string
            inline: boolean
          }>
          timestamp: boolean
        }
      }
    }
    direct: {
      status: boolean,
      join: {
        message?: string
        embed: {
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
          fields: Array<{
            id: number
            name: string
            value: string
            inline: boolean
          }>
          timestamp: boolean
        }
      }
    }
  }
}