import { ButtonStyle } from 'discord.js'
import NoirClient from '../../../../structures/Client'

export default class EmbedCommandUtils {
  static getPremiumStatus(client: NoirClient, guildId?: string): boolean {
    return guildId ? client.premium.get(guildId)?.status ?? false : false
  }

  static generateComponentId(id: string, type: string, component: 'button' | 'modal' | 'input' | 'select'): string {
    return `embed-${id}-${type}-${component}`
  }

  static generateButtonStyle(value?: unknown): ButtonStyle {
    return value ? ButtonStyle.Success : ButtonStyle.Secondary
  }
}