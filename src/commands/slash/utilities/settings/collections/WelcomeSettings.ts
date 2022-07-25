import { Welcome } from '@prisma/client'
import { ChannelType, Interaction, Role, TextChannel, Webhook } from 'discord.js'
import Colors from '../../../../../constants/Colors'
import Options from '../../../../../constants/Options'
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
      role: null,
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

    if (channelId == Options.removeValue) {
      if (!this.data.channel) return
      if (!this.data.webhook) return

      const channel = client.channels.cache.get(this.data.channel) as TextChannel
      const webhooks = await channel.fetchWebhooks()

      await webhooks.get(this.data.webhook)?.delete()

      this.data.channel = null
      this.data.webhook = null

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

  public async getRole(interaction: Interaction, roleId: string): Promise<Role | undefined> {
    const role = interaction.guild?.roles.cache.get(roleId)

    if (roleId == Options.removeValue) {
      this.data.role = null

      return
    }

    if (!role) return

    this.data.role = roleId

    return role
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
          messages: this.data.messages,
          webhook: this.data.webhook,
          channel: this.data.channel,
          status: this.data.status,
          role: this.data.role
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