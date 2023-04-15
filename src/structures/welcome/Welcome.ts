import Client from '@structures/Client'
import { ChannelType, parseWebhookURL } from 'discord.js'

export default class Welcome {
  public guild: string
  public status?: boolean
  public restore?: boolean
  public roles?: string[]
  public webhook?: string
  public webhookName?: string
  public webhookAvatar?: string
  public webhookChannel?: string

  constructor(guild: string, options?: { status: boolean, restore: boolean, roles: string[], webhook?: string, webhookAvatar?: string, webhookName?: string, webhookChannel?: string }) {
    this.guild = guild
    this.status = options?.status ?? false
    this.restore = options?.restore ?? false
    this.roles = options?.roles ?? []
    this.webhook = options?.webhook
  }

  public static async cache(client: Client, guildId: string, force?: boolean, cached?: boolean) {
    const cache = client.welcome.get((cached ? '(cached)' : '') + guildId)

    if (!cache || force) {
      let data = await client.prisma.welcome.findFirst({ where: { guild: guildId } })

      if (!data) {
        data = await client.prisma.welcome.create({ data: { guild: guildId } })
      }

      return client.welcome.set((cached ? '(cached)' : '') + guildId, new Welcome(guildId, {
        restore: data.restore,
        roles: data.roles,
        status: data.status,
        webhook: data.webhook as string | undefined,
      })).get((cached ? '(cached)' : '') + guildId)!
    }

    return cache
  }

  public static async save(client: Client, guildId: string) {
    const cache = client.welcome.get('(cached)' + guildId)

    if (cache) {
      const data = await client.prisma.welcome.findFirst({ where: { guild: guildId } })

      client.welcome.delete(guildId)
      client.welcome.set(guildId, cache)

      if (!data) {
        await client.prisma.welcome.create({ data: { guild: guildId } })
      }

      else {
        if (cache.webhookChannel) {
          await this.saveWebhook(client, guildId, cache.webhookChannel)
        }

        await client.prisma.welcome.updateMany({
          where: { guild: cache.guild },
          data: {
            guild: cache.guild,
            restore: cache.restore,
            roles: cache.roles,
            status: cache.status,
            webhook: cache.webhook
          }
        })
      }
    }

    return cache
  }

  private static async saveWebhook(client: Client, guildId: string, channelId: string) {
    const channel = client.channels.cache.get(channelId)

    if (channel?.type != ChannelType.GuildText) return

    const data = await this.cache(client, '(cached)' + guildId)

    if (!data.webhook) {
      const webhook = await channel.createWebhook({
        name: data?.webhookName ?? 'Noir Welcome',
        avatar: data?.webhookAvatar ?? client.user?.avatarURL()
      })

      data.webhook = webhook.url
      data.webhookAvatar = data.webhookAvatar ?? webhook.avatarURL() ?? undefined
      data.webhookName = data.webhookName ?? 'Noir Welcome'
    }

    else {
      const webhook = await this.getWebhook(client, data.webhook)

      if (!webhook) {
        const webhook = await channel.createWebhook({
          name: data.webhookName ?? 'Noir Welcome',
          avatar: data.webhookAvatar ?? client.user?.avatarURL()
        })

        data.webhook = webhook.url
        data.webhookAvatar = webhook.avatarURL() as string | undefined
        data.webhookName = webhook.name ?? 'Noir Welcome'
      }

      else {
        await webhook.edit({
          name: data?.webhookName ?? webhook.name ?? 'Noir Welcome',
          avatar: data?.webhookAvatar ?? webhook.avatarURL() ?? client.user?.avatarURL(),
          channel: data.webhookChannel ?? webhook.channelId
        })
      }
    }
  }

  public static async getWebhook(client: Client, webhookURL: string) {
    const webhookData = parseWebhookURL(webhookURL)

    if (!webhookData) return

    try {
      const webhook = await client.fetchWebhook(webhookData?.id, webhookData?.token)

      return webhook
    } catch {
      return
    }
  }
}