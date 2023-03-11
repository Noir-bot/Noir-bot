import Client from '@structures/Client'
import { ChannelType, parseWebhookURL } from 'discord.js'

export default class Moderation {
  public guild: string
  public status: boolean
  public logs: boolean
  public rules: boolean
  public webhook?: string
  public webhookName?: string
  public webhookAvatar?: string
  public webhookChannel?: string

  constructor(guild: string, options: ModerationInterface) {
    this.guild = guild
    this.status = options.status
    this.logs = options.logs
    this.rules = options.rules
    this.webhook = options.webhook
  }

  public static async getWebhook(client: Client, webhookURL: string) {
    const webhookData = parseWebhookURL(webhookURL)

    if (!webhookData) return

    const webhook = await client.fetchWebhook(webhookData?.id, webhookData?.token).catch(() => undefined)

    return webhook
  }

  private static async saveWebhook(client: Client, guildId: string, channelId: string) {
    const channel = client.channels.cache.get(channelId)

    if (channel?.type != ChannelType.GuildText) return

    const data = await this.cache(client, guildId)

    if (!data.webhook) {
      const webhook = await channel.createWebhook({
        name: data.webhookName ?? 'Noir Moderation',
        avatar: data.webhookAvatar ?? client.user?.avatarURL()
      })

      data.webhook = webhook.url
      data.webhookAvatar = data.webhookAvatar ?? webhook.avatarURL() ?? undefined
      data.webhookName = data.webhookName ?? 'Noir Moderation'
    }

    else {
      const webhook = await this.getWebhook(client, data.webhook).catch(() => undefined)

      if (!webhook) {
        const webhook = await channel.createWebhook({
          name: data.webhookName ?? 'Noir Moderation',
          avatar: data.webhookAvatar ?? client.user?.avatarURL()
        })

        data.webhook = webhook.url
        data.webhookAvatar = webhook.avatarURL() as string | undefined
        data.webhookName = data.webhookName ?? 'Noir Moderation'
      }

      else {
        await webhook.edit({
          name: data.webhookName ?? webhook.name ?? 'Noir Moderation',
          avatar: webhook.avatarURL() ?? client.user?.avatarURL(),
          channel: data.webhookChannel ?? webhook.channelId
        })
      }
    }
  }

  public static async cache(client: Client, guildId: string, force?: boolean, cached?: boolean) {
    const cache = client.moderation.get((cached ? '(cached)' : '') + guildId)

    if (!cache || force) {
      let data = await client.prisma.moderation.findFirst({ where: { guild: guildId } })

      if (!data) {
        data = await client.prisma.moderation.create({ data: { guild: guildId } })
      }

      return client.moderation.set((cached ? '(cached)' : '') + guildId, new Moderation(guildId, {
        status: data.status,
        logs: data.logs,
        rules: data.rules,
        webhook: data.webhook as string | undefined
      })).get((cached ? '(cached)' : '') + guildId)!
    }

    return cache
  }

  public static async save(client: Client, guildId: string) {
    const cache = client.moderation.get('(cached)' + guildId)

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
          data: {
            guild: cache.guild,
            status: cache.status,
            logs: cache.logs,
            rules: cache.rules,
            webhook: cache.webhook
          }
        })
      }
    }

    return cache
  }
}

export interface ModerationInterface {
  status: boolean
  logs: boolean
  rules: boolean
  webhook?: string
}