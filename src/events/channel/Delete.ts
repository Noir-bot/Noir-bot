import Colors from "@constants/Colors"
import Emojis from '@constants/Emojis'
import Logs from "@helpers/Logs"
import Client from "@structures/Client"
import Event from "@structures/Event"
import { AuditLogEvent, GuildChannel, time } from 'discord.js'

export default class ChannelDelete extends Event {
  constructor(client: Client) {
    super(client, 'channelDelete', false)
  }

  async execute(client: Client, channel: GuildChannel) {
    const auditLogs = await channel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelDelete, limit: 1 })
    const eventInfo = auditLogs.entries.first()

    const details = `${Emojis.channel} Channel: ${channel.name} \`${channel.id}\`\n` +
      `${channel.parent ? `${Emojis.chain} Category: ${channel.parent.name} \`${channel.parent.id}\`\n` : ''}` +
      `${eventInfo?.executor ? `${Emojis.user} Moderator: ${eventInfo?.executor?.username} \`${eventInfo?.executor?.id}\`\n` : ''}` +
      `${eventInfo?.reason ? `${Emojis.document} Reason: ${eventInfo?.reason}` : ''}` +
      `${Emojis.time} Created at: ${time(channel.createdAt, 'd')} (${time(channel.createdAt, 'R')})\n` +
      `${Emojis.time} Deleted at: ${time(new Date(), 'd')} (${time(new Date(), 'R')})`

    Logs.log({
      client,
      guild: channel.guildId,
      title: 'Channel delete',
      color: Colors.logsGuild,
      description: details
    })
  }
}