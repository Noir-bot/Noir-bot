import { ChannelType, parseWebhookURL } from 'discord.js'
import Options from '../constants/Options'
import NoirClient from './Client'

export default class Welcome {
  public guild: string
  public status?: boolean
  public restore?: boolean
  public roles?: string[]
  public webhook?: string
  public webhookAvatar?: string
  public webhookName?: string
  public webhookChannel?: string

  constructor(guild: string, options?: { status: boolean, restore: boolean, roles: string[], webhook?: string, webhookAvatar?: string, webhookName?: string, webhookChannel?: string }) {
    this.guild = guild
    this.status = options?.status ?? false
    this.restore = options?.restore ?? false
    this.roles = options?.roles ?? []
    this.webhook = options?.webhook
    this.webhookAvatar = options?.webhookAvatar
    this.webhookName = options?.webhookName
    this.webhookChannel = options?.webhookChannel
  }

  public static async getWebhook(client: NoirClient, webhookURL: string) {
    const webhookData = parseWebhookURL(webhookURL)

    if (!webhookData) return

    const webhook = await client.fetchWebhook(webhookData?.id, webhookData?.token)

    return webhook
  }

  private static async saveWebhook(client: NoirClient, guildId: string, channelId: string) {
    const channel = client.channels.cache.get(channelId)

    if (channel?.type != ChannelType.GuildText) return

    const data = await this.cache(client, guildId)

    if (!data.webhook) {
      const webhook = await channel.createWebhook({
        name: data?.webhookName ?? 'Noir Welcome',
        avatar: data?.webhookAvatar ?? Options.clientAvatar
      })

      data.webhook = webhook.url
      data.webhookAvatar = webhook.avatarURL() as string | undefined
      data.webhookName = webhook.name
    }

    else {
      const webhook = await this.getWebhook(client, data.webhook)

      if (!webhook) {
        const webhook = await channel.createWebhook({
          name: data?.webhookName ?? 'Noir Welcome',
          avatar: data?.webhookAvatar ?? Options.clientAvatar
        })

        data.webhook = webhook.url
        data.webhookAvatar = webhook.avatarURL() as string | undefined
        data.webhookName = webhook.name
      }

      else {
        await webhook.edit({
          name: data?.webhookName ?? webhook.name,
          avatar: data?.webhookAvatar ?? webhook.avatarURL(),
          channel: data.webhookChannel ?? webhook.channelId
        })
      }
    }
  }

  public static async save(client: NoirClient, guildId: string) {
    const cache = client.welcome.get(guildId)

    if (cache) {
      const data = await client.prisma.welcome.findFirst({ where: { guild: guildId } })

      if (!data) {
        await client.prisma.welcome.create({ data: { guild: guildId } })
      }

      else {
        if (data.webhookChannel) {
          await this.saveWebhook(client, guildId, data.webhookChannel)
        }

        await client.prisma.welcome.updateMany({
          where: { guild: cache.guild },
          data: cache
        })
      }
    }

    return cache
  }

  public static async cache(client: NoirClient, guildId: string, force?: boolean) {
    const cache = client.welcome.get(guildId)

    if (!cache || force) {
      let data = await client.prisma.welcome.findFirst({ where: { guild: guildId } })

      if (!data) {
        data = await client.prisma.welcome.create({ data: { guild: guildId } })
      }

      return client.welcome.set(guildId, new Welcome(guildId, {
        restore: data.restore,
        roles: data.roles,
        status: data.status,
        webhook: data.webhook as string | undefined,
        webhookAvatar: data.webhookAvatar as string | undefined,
        webhookChannel: data.webhookChannel as string | undefined,
        webhookName: data.webhookName as string | undefined
      })).get(guildId)!
    }

    return cache
  }
}