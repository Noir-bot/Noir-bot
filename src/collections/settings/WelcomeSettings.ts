import { Welcome } from '@prisma/client'
import { ChannelType } from 'discord.js'
import Colors from '../../constants/Colors'
import NoirClient from '../../structures/Client'

type WelcomeSettingsData = Omit<Welcome, 'id'>

export default class WelcomeSettings {
  private _id: string
  private _data: WelcomeSettingsData

  constructor(id: string) {
    this._id = id
    this._data = {
      guild: this._id,
      status: false,
      channel: null,
      messages: {
        guild: {
          status: false,
          join: {
            embed: {
              author: 'Welcome',
              authorImage: null,
              color: Colors.primaryHex,
              description: '{{user}} welcome to {{guild}}',
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
              description: '{{user}} left the guild',
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

  public setChannel(client: NoirClient, channelId: string): void {
    const channel = client.channels.cache.get(channelId.trim())

    if (!channel) return
    if (!(channel.type == ChannelType.GuildText)) return

    this.data.channel = channel.id
  }

  public async cache(client: NoirClient) {
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
          channel: this.data.channel,
          messages: this.data.messages,
          status: this.data.status
        }
      })
    }

    return welcomeData
  }

  public async send(client: NoirClient) {
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

    return welcomeData
  }
}