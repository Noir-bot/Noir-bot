import { ChannelType, TextChannel, Webhook } from 'discord.js'
import Options from '../../../../../constants/Options'
import NoirClient from '../../../../../structures/Client'

export default class SettingsCommandWelcomeCollection {
  private _id: string
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

  public get id(): string {
    return this._id
  }

  public get data(): WelcomeCollectionData {
    return this._data
  }

  public async cacheData(client: NoirClient): Promise<void> {
    let welcomeData = await client.prisma.welcome.findFirst({
      where: { guild: this.id }
    })

    if (!welcomeData) {
      welcomeData = await client.prisma.welcome.create({
        data: this.data
      })
    }

    if (welcomeData) {
      welcomeData = await client.prisma.welcome.update({
        where: {
          guild: this.id
        },
        data: this.data
      })
    }
  }

  public async requestData(client: NoirClient): Promise<void> {
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
      channel: welcomeData.channel || undefined,
      webhook: welcomeData.webhook || undefined,
      messages: {
        guild: {
          status: false,
          join: {
            message: undefined,
            embed: {
              url: undefined,
              color: undefined,
              title: undefined,
              author: undefined,
              footer: undefined,
              authorImage: undefined,
              footerImage: undefined,
              description: undefined,
              thumbnail: undefined,
              image: undefined,
              timestamp: false,
              fields: []
            }
          },
          left: {
            message: undefined,
            embed: {
              url: undefined,
              color: undefined,
              title: undefined,
              author: undefined,
              footer: undefined,
              authorImage: undefined,
              footerImage: undefined,
              description: undefined,
              thumbnail: undefined,
              image: undefined,
              timestamp: false,
              fields: []
            }
          }
        },
        direct: {
          status: false,
          join: {
            message: undefined,
            embed: {
              url: undefined,
              color: undefined,
              title: undefined,
              author: undefined,
              footer: undefined,
              authorImage: undefined,
              footerImage: undefined,
              description: undefined,
              thumbnail: undefined,
              image: undefined,
              timestamp: false,
              fields: []
            }
          }
        }
      }
    }
  }

  public async getWebhook(client: NoirClient, channelId: string): Promise<Webhook | undefined> {
    const channel = client.channels.cache.get(channelId.trim())

    if (channelId == Options.removeValue) {
      if (!this.data.channel || !this.data.webhook) return

      const channel = client.channels.cache.get(this.data.channel) as TextChannel
      const webhooks = await channel.fetchWebhooks()

      await webhooks.get(this.data.webhook)?.delete()

      this.data.channel = undefined
      this.data.webhook = undefined

      return
    }

    if (!channel) return
    if (channel.type != ChannelType.GuildText) return

    const oldChannelId = this.data.channel
    const webhookId = this.data.webhook

    if (!webhookId) {
      const newWebhook = await channel.createWebhook({
        name: 'Noir Welcome',
        avatar: channel.guild.iconURL()
      })

      this.data.webhook = newWebhook.id
      this.data.channel = newWebhook.channelId

      return newWebhook
    }

    const webhooks = await channel.fetchWebhooks()
    const webhook = webhooks.get(webhookId)

    if (!webhook && oldChannelId) {
      const oldChannel = client.channels.cache.get(oldChannelId) as TextChannel
      const oldChannelWebhooks = await oldChannel.fetchWebhooks()
      const oldWebhook = oldChannelWebhooks.get(webhookId)

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

  public addRole(client: NoirClient, guildId: string, roleId: string): void {
    const role = client.guilds.cache.get(guildId)?.roles.cache.get(roleId)

    if (!role) return
    if (this.data.roles.length == 2 && !client.utils.premiumStatus(guildId) || this.data.roles.length == 5) return
    if (this.data.roles.includes(roleId)) return

    this.data.roles.push(roleId)
  }

  public removeRole(roleId: string): void {
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
          title?: string
          author?: string
          footer?: string
          authorImage?: string
          footerImage?: string
          description?: string
          thumbnail?: string
          image?: string
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
          title?: string
          author?: string
          footer?: string
          authorImage?: string
          footerImage?: string
          description?: string
          thumbnail?: string
          image?: string
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
          title?: string
          author?: string
          footer?: string
          authorImage?: string
          footerImage?: string
          description?: string
          thumbnail?: string
          image?: string
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