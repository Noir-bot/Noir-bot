import Colors from '@constants/Colors'
import Emojis from '@constants/Emojis'
import Logs from '@helpers/Logs'
import Client from '@structures/Client'
import Event from '@structures/Event'
import { AuditLogEvent, GuildBan, time } from 'discord.js'

export default class UserBan extends Event {
  constructor(client: Client) {
    super(client, 'guildBanAdd', false)
  }

  public async execute(client: Client, ban: GuildBan): Promise<void> {
    const auditLogs = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd, limit: 1 })
    const eventInfo = auditLogs.entries.first()

    const details = `${Emojis.rulebrekaer} User: ${ban.user.username} \`${ban.user.id}\`\n` +
      `${eventInfo?.executor ? `${Emojis.user} Moderator: ${eventInfo?.executor.username} \`${eventInfo.executor.id}\`\n` : ''}` +
      `${ban.reason ? `${Emojis.document} Reason: ${ban.reason}\n` : ''}` +
      `${eventInfo?.createdAt ? `${Emojis.time} Banned at: ${time(eventInfo.createdAt, 'd')} (${time(eventInfo.createdAt, 'R')})\n` : ''}`

    const logs = await Logs.log({
      client,
      guild: ban.guild.id,
      author: 'Ban case',
      description: details,
      color: Colors.logsCase
    })

    const banCase = await client.prisma.case.findFirst({
      where: {
        guild: ban.guild.id,
        user: ban.user.id,
        action: 'ban'
      }
    })

    if (!banCase && eventInfo?.executorId) {
      await client.prisma.case.create({
        data: {
          guild: ban.guild.id,
          user: ban.user.id,
          action: 'ban',
          reason: ban.reason,
          moderator: eventInfo?.executorId,
          reference: logs?.id,
          created: eventInfo?.createdAt,
          updated: eventInfo?.createdAt,
          resolved: false
        }
      })
    }
  }
}