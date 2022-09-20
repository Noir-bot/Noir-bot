import { ChannelType, TextChannel } from 'discord.js'
import Options from '../../../../../constants/Options'
import NoirClient from '../../../../../structures/Client'

export default class SettingsCommandWelcomeCollection {
  private readonly _id: string
  private _data: WelcomeCollectionData

  constructor(id: string) {
    this._id = id
    this._data = {
      guild: id,
      status: false,
      channel: undefined,
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
      welcomeData = await client.prisma.welcome.create({
        data: this.data
      })
    }

    welcomeData = await client.prisma.welcome.update({
      where: {
        guild: this.id
      },
      data: this.data
    })
  }

  public async cacheData(client: NoirClient) {
    let welcomeData = await client.prisma.welcome.findFirst({
      where: { guild: this.id }
    })

    if (!welcomeData) {
      welcomeData = await client.prisma.welcome.create({
        data: this.data
      })
    }

    this._data = {
      guild: welcomeData.guild,
      status: welcomeData.status,
      roles: welcomeData.roles,
      channel: welcomeData.channel ?? undefined,
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

  public async getWebhook(client: NoirClient, channelId: string) {
    const channel = client.channels.cache.get(channelId.trim()) ?? await client.channels.fetch(channelId.trim())

    if (channelId == Options.removeValue) {
      if (!this.data.channel || !this.data.webhook) return

      const channel = (client.channels.cache.get(this.data.channel) ?? await client.channels.fetch(this.data.channel)) as TextChannel
      const webhooks = await channel.fetchWebhooks()

      await webhooks.get(this.data.webhook)?.delete()

      this.data.channel = undefined
      this.data.webhook = undefined

      return
    }

    if (!channel) return
    if (channel.type != ChannelType.GuildText) return

    const currentChannelId = this.data.channel
    const currentWebhookId = this.data.webhook

    if (!currentWebhookId) {
      const newWebhook = await channel.createWebhook({
        name: 'Noir Welcome',
        avatar: channel.guild.iconURL()
      })

      this.data.webhook = newWebhook.id
      this.data.channel = newWebhook.channelId

      return newWebhook
    }

    const webhooks = await channel.fetchWebhooks()
    const webhook = webhooks.get(currentWebhookId)

    if (!webhook && currentChannelId) {
      const oldChannel = (client.channels.cache.get(currentChannelId) ?? await client.channels.fetch(currentChannelId)) as TextChannel
      const oldChannelWebhooks = await oldChannel.fetchWebhooks()
      const oldWebhook = oldChannelWebhooks.get(currentWebhookId)

      if (!oldWebhook || !oldChannel) {
        const newWebhook = await channel.createWebhook({
          name: 'Noir Welcome',
          avatar: channel.guild.iconURL()
        })

        this.data.webhook = newWebhook.id
        this.data.channel = newWebhook.channelId

        return newWebhook
      }

      return await oldWebhook.edit({
        channel: channel
      })
    }

    else if (!webhook) {
      const webhook = await channel.createWebhook({
        name: 'Noir Welcome',
        avatar: channel.guild.iconURL()
      })

      this.data.webhook = webhook.id
      this.data.channel = webhook.channelId

      return webhook
    }

    return webhook
  }

  public addRole(client: NoirClient, guildId: string, roleId: string) {
    const role = client.guilds.cache.get(guildId)?.roles.cache.get(roleId)

    if (!role) return
    if (this.data.roles.length == 2 && !client.utils.premiumStatus(guildId) || this.data.roles.length == 5) return
    if (this.data.roles.includes(roleId)) return

    this.data.roles.push(roleId)
  }

  public removeRole(roleId: string) {
    if (!this.data.roles.includes(roleId)) return

    this.data.roles = this.data.roles.filter(role => role != roleId)
  }
}

interface WelcomeCollectionData {
  guild: string
  status: boolean
  roles: string[]
  channel?: string
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