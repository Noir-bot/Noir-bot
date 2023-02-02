import { ChannelType, parseWebhookURL } from 'discord.js'
import Options from '../constants/Options'
import NoirClient from './Client'

export default class Moderation {
  public guild: string
  public status: boolean
  public roles: string[]
  public modLogs: boolean
  public rulesLogs: boolean
  public webhook?: string
  public webhookName?: string
  public webhookAvatar?: string
  public webhookChannel?: string

  constructor(guild: string, options: ModerationInterface) {
    this.guild = guild
    this.status = options.status
    this.roles = options.roles
    this.modLogs = options.modLogs
    this.rulesLogs = options.rulesLogs
    this.webhook = options.webhook
    this.webhookName = options.webhookName
    this.webhookAvatar = options.webhookAvatar
    this.webhookChannel = options.webhookChannel
  }

  public static async getWebhook(client: NoirClient, webhookURL: string) {
    const webhookData = parseWebhookURL(webhookURL)

    if (!webhookData) return

    const webhook = await client.fetchWebhook(webhookData?.id, webhookData?.token).catch(() => undefined)

    return webhook
  }

  private static async saveWebhook(client: NoirClient, guildId: string, channelId: string) {
    const channel = client.channels.cache.get(channelId)

    if (channel?.type != ChannelType.GuildText) return

    const data = await this.cache(client, guildId)

    if (!data.webhook) {
      const webhook = await channel.createWebhook({
        name: data?.webhookName ?? 'Noir Moderation',
        avatar: data?.webhookAvatar ?? Options.clientAvatar
      })

      data.webhook = webhook.url
      data.webhookAvatar = webhook.avatarURL() as string | undefined
      data.webhookName = webhook.name
    }

    else {
      const webhook = await this.getWebhook(client, data.webhook).catch(() => undefined)

      if (!webhook) {
        const webhook = await channel.createWebhook({
          name: data?.webhookName ?? 'Noir Moderation',
          avatar: data?.webhookAvatar ?? Options.clientAvatar
        })

        data.webhook = webhook.url
        data.webhookAvatar = webhook.avatarURL() as string | undefined
        data.webhookName = webhook.name
      }

      else {
        await webhook.edit({
          name: data?.webhookName ?? 'Noir Moderation',
          avatar: data?.webhookAvatar ?? Options.clientAvatar,
          channel: data.webhookChannel
        })
      }
    }
  }

  public static async cache(client: NoirClient, guildId: string, restore: boolean = false) {
    const cache = client.moderation.get(guildId)

    if (!cache || restore) {
      let data = await client.prisma.moderation.findFirst({ where: { guild: guildId } })

      if (!data) {
        data = await client.prisma.moderation.create({ data: { guild: guildId } })
      }

      return client.moderation.set(guildId, new Moderation(guildId, {
        roles: data.roles,
        status: data.status,
        modLogs: data.modLogs,
        rulesLogs: data.rulesLogs,
        webhook: data.webhook as string | undefined,
        webhookName: data.webhookName as string | undefined,
        webhookAvatar: data.webhookAvatar as string | undefined,
        webhookChannel: data.webhookChannel as string | undefined
      })).get(guildId)!
    }

    return cache
  }

  public static async save(client: NoirClient, guildId: string) {
    const cache = client.moderation.get(guildId)

    if (cache) {
      const data = await client.prisma.moderation.findFirst({ where: { guild: guildId } })

      if (!data) {
        await client.prisma.moderation.create({ data: { guild: guildId } })
      }

      else {
        if (cache.webhookChannel) {
          await this.saveWebhook(client, guildId, cache.webhookChannel)
        }

        await client.prisma.moderation.updateMany({
          where: { guild: cache.guild },
          data: cache
        })
      }
    }

    return cache
  }
}

export interface ModerationInterface {
  status: boolean
  roles: string[]
  modLogs: boolean
  rulesLogs: boolean
  webhook?: string
  webhookName?: string
  webhookAvatar?: string
  webhookChannel?: string
}