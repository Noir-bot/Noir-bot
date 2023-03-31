import Colors from "@constants/Colors"
import Emojis from "@constants/Emojis"
import Logs from "@helpers/Logs"
import Client from "@structures/Client"
import { AuditLogEvent, GuildAuditLogsEntry, GuildMember, time } from "discord.js"

export default class UserKick {
  public static async response(client: Client, member: GuildMember, eventInfo: GuildAuditLogsEntry<AuditLogEvent.MemberKick>): Promise<void> {
    const details = `${Emojis.rulebrekaer} User: ${member.user.username} \`${member.user.id}\`\n` +
      `${eventInfo?.executor ? `${Emojis.user} Moderator: ${eventInfo?.executor.username} \`${eventInfo.executor.id}\`\n` : ''}` +
      `${eventInfo.reason ? `${Emojis.document} Reason: ${eventInfo.reason}\n` : ''}` +
      `${eventInfo?.createdAt ? `${Emojis.time} Kicked at: ${time(eventInfo.createdAt, 'd')} (${time(eventInfo.createdAt, 'R')})\n` : ''}`

    const logs = await Logs.log({
      client,
      guild: member.guild.id,
      author: 'Kick case',
      description: details,
      color: Colors.logsCase
    })

    const banCase = await client.prisma.case.findFirst({
      where: {
        guild: member.guild.id,
        user: member.user.id,
        action: 'kick'
      }
    })

    if (!banCase && eventInfo?.executorId) {
      await client.prisma.case.create({
        data: {
          guild: member.guild.id,
          user: member.user.id,
          action: 'kick',
          reason: eventInfo.reason,
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