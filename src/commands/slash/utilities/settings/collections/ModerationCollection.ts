import { parseWebhookURL } from 'discord.js'
import NoirClient from '../../../../../structures/Client'
export default class ModerationCollection {
  private readonly _id: string
  private _data: ModerationCollectionData

  constructor(id: string) {
    this._id = id
    this._data = {
      guild: id,
      logs: {
        status: false
      },
      rules: {
        status: false,
        rules: []
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
    let moderationData = await client.prisma.moderation.findFirst({
      where: { guild: this.id }
    })

    if (!moderationData) {
      moderationData = await client.prisma.moderation.create({ data: this.data })
    }

    moderationData = await client.prisma.moderation.update({
      where: { guild: this.id },
      data: this.data
    })
  }

  public async cacheData(client: NoirClient) {
    let moderationData = await client.prisma.moderation.findFirst({
      where: { guild: this.id }
    })

    if (!moderationData) {
      moderationData = await client.prisma.moderation.create({ data: this.data })
    }

    this._data = {
      guild: moderationData.guild,
      logs: {
        status: moderationData.logs.status,
        webhook: moderationData.logs.webhook ?? undefined,
        rawWebhookAvatar: moderationData.logs.rawWebhookAvatar ?? undefined
      },
      rules: {
        status: moderationData.rules.status,
        rules: moderationData.rules.rules as any
      }
    }
  }

  public async getWebhook(client: NoirClient) {
    const moderationData = client.moderationSettings.get(this.id)

    if (!moderationData || !moderationData.data.logs.webhook) return undefined
    const webhookData = parseWebhookURL(moderationData.data.logs.webhook)

    if (!webhookData) return undefined
    const webhook = await client.fetchWebhook(webhookData?.id, webhookData?.token)

    return webhook
  }
}

interface ModerationCollectionData {
  guild: string
  logs: {
    status: boolean
    webhook?: string
    rawWebhookAvatar?: string
  },
  rules: {
    status: boolean,
    rules: ModerationRule[]
  }
}

interface ModerationRule {
  id: number
  type: ModerationRuleTypes
  quantity: number
  duration?: string
}

export type ModerationRuleTypes = 'restrict' | 'ban' | 'kick' | 'softban' | 'tempban'
export const ModerationRuleRegex = /^restriction$|^ban$|^kick$|^softban$|^tempban$/