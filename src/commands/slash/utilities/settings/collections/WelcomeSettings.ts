import { Welcome } from '@prisma/client'
import { ChannelType, TextChannel, Webhook } from 'discord.js'
import Colors from '../../../../../constants/Colors'
import NoirClient from '../../../../../structures/Client'

type WelcomeSettingsData = Omit<Welcome, 'id'>

export default class WelcomeSettings {
  private _id: string
  private _data: WelcomeSettingsData

  constructor(id: string) {
    this._id = id
    this._data = {
      guild: this._id,
      status: false,
      webhook: null,
      channel: null,
      messages: {
        guild: {
          status: false,
          join: {
            embed: {
              author: 'Welcome',
              authorImage: null,
              color: Colors.primaryHex,
              description: '{{user}} join {{guild}}',
              footer: null,
              footerImage: null,
              image: null,
              thumbnail: null,
              title: null,
              url: null,
              fields: [],
              timestamp: false
            },
            message: null
          },
          leave: {
            embed: {
              author: 'Goodbye',
              authorImage: null,
              color: Colors.secondaryHex,
              description: '{{user}} left {{guild}}',
              footer: null,
              footerImage: null,
              image: null,
              thumbnail: null,
              title: null,
              url: null,
              fields: [],
              timestamp: false
            },
            message: null
          }
        },
        direct: {
          status: false,
          join: {
            embed: {
              author: 'Welcome',
              authorImage: null,
              color: Colors.primaryHex,
              description: '{{user}} welcome to guild',
              footer: null,
              footerImage: null,
              image: null,
              thumbnail: null,
              title: null,
              url: null,
              fields: [],
              timestamp: false
            },
            message: null
          }
        }
      },
    }
  }

  public get id(): string {
    return this._id
  }

  public get data(): WelcomeSettingsData {
    return this._data
  }

  public async getWebhook(client: NoirClient, channelId: string): Promise<Webhook | undefined> {
    const channel = client.channels.cache.get(channelId.trim())

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

  public async cacheData(client: NoirClient): Promise<void> {
    let welcomeData = await client.prisma.welcome.findFirst({
      where: {
        guild: this.id
      }
    })

    if (!welcomeData) {
      welcomeData = await client.prisma.welcome.create({
        data: this.data
      })
    }

    if (welcomeData) {
      await client.prisma.welcome.updateMany({
        where: {
          guild: this.id
        },
        data: {
          webhook: this.data.webhook,
          messages: this.data.messages,
          status: this.data.status
        }
      })
    }
  }

  public async requestData(client: NoirClient): Promise<void> {
    let welcomeData = await client.prisma.welcome.findFirst({
      where: {
        guild: this.id
      }
    })

    if (!welcomeData) {
      welcomeData = await client.prisma.welcome.create({
        data: this.data
      })
    }

    this._data = welcomeData
  }
}