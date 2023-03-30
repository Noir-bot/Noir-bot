import Colors from '@constants/Colors'
import Emojis from '@constants/Emojis'
import Logs from '@helpers/Logs'
import Utils from '@helpers/Utils'
import Client from '@structures/Client'
import Event from '@structures/Event'
import { AuditLogEvent, ChannelType, GuildChannel, time } from 'discord.js'

export default class ChannelUpdate extends Event {
  constructor(client: Client) {
    super(client, 'channelUpdate', false)
  }

  async execute(client: Client, oldChannel: GuildChannel, newChannel: GuildChannel) {
    let changes: string = ''
    const fields = []

    if (oldChannel.name != newChannel.name) {
      changes += `${Emojis.embedAuthor} Name: ${oldChannel.name} ${Emojis.rightArrow} ${newChannel.name}\n`
    }

    if (oldChannel.parentId != newChannel.parentId) {
      changes += `${Emojis.chain} Category: ${oldChannel.parent?.name} ${Emojis.rightArrow} ${newChannel.parent?.name}\n`
    }

    if (oldChannel.rawPosition != newChannel.rawPosition) {
      const status = oldChannel.rawPosition + 1 == newChannel.rawPosition || oldChannel.rawPosition - 1 == newChannel.rawPosition

      if (!status) {
        changes += `${Emojis.editField} Position: ${oldChannel.rawPosition} ${Emojis.rightArrow} ${newChannel.rawPosition}\n`
      }
    }

    if (oldChannel.isTextBased() && newChannel.isTextBased()) {
      if (oldChannel.type == ChannelType.GuildText && newChannel.type == ChannelType.GuildText) {
        if (newChannel.topic && oldChannel.topic != newChannel.topic) {
          changes += `${Emojis.book} Topic: ${oldChannel.topic || 'No description'} ${Emojis.rightArrow} ${newChannel.topic || 'No description'}\n`
        }

        if (newChannel.rateLimitPerUser && oldChannel.rateLimitPerUser != newChannel.rateLimitPerUser) {
          changes += `${Emojis.timer} Cooldown: ${Utils.formatTime(oldChannel.rateLimitPerUser * 1000) ?? 0} ${Emojis.rightArrow} ${Utils.formatTime(newChannel.rateLimitPerUser * 1000 ?? 0)}\n`
        }

        if (newChannel.nsfw && oldChannel.nsfw != newChannel.nsfw) {
          changes += `${Emojis.lock} Age restricted: ${oldChannel.nsfw ? Emojis.enable : Emojis.disable} ${Emojis.rightArrow} ${newChannel.nsfw ? Emojis.enable : Emojis.disable}\n`
        }
      }
    }

    if (oldChannel.isVoiceBased() && newChannel.isVoiceBased()) {
      if (oldChannel.type == ChannelType.GuildVoice && newChannel.type == ChannelType.GuildVoice) {
        if (oldChannel.bitrate != newChannel.bitrate) {
          changes += `${Emojis.status} Bitrate: ${oldChannel.bitrate / 1000 ?? 0}kbps ${Emojis.rightArrow} ${newChannel.bitrate / 1000 ?? 0}kbps\n`
        }

        if (newChannel.userLimit && oldChannel.userLimit != newChannel.userLimit) {
          changes += `${Emojis.user} User limit: ${oldChannel.userLimit} ${Emojis.rightArrow} ${newChannel.userLimit}\n`
        }

        if (newChannel.rtcRegion && oldChannel.rtcRegion != newChannel.rtcRegion) {
          changes += `${Emojis.globe} Region: ${oldChannel.rtcRegion} ${Emojis.rightArrow} ${newChannel.rtcRegion}\n`
        }

        if (oldChannel.nsfw != newChannel.nsfw) {
          changes += `${Emojis.lock} Age restricted: ${oldChannel.nsfw ? Emojis.enable : Emojis.disable} ${Emojis.rightArrow} ${newChannel.nsfw ? Emojis.enable : Emojis.disable}\n`
        }
      }
    }

    if (changes != '') {
      const auditLogs = await newChannel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelUpdate, limit: 1 })
      const eventInfo = auditLogs.entries.first()

      if (eventInfo?.createdAt) {
        changes += `${Emojis.time} Updated at: ${time(eventInfo?.createdAt, 'd')} (${time(eventInfo.createdAt, 'R')})\n`
      }

      if (eventInfo?.reason) {
        changes = `${Emojis.document} Reason: ${eventInfo?.reason}\n` + changes
      }

      if (eventInfo?.executor) {
        changes = `${Emojis.user} Moderator: ${eventInfo?.executor?.username} \`${eventInfo?.executor?.id}\`\n` + changes
      }

      changes = `${Emojis.channel} Channel: ${newChannel.name} \`${newChannel.id}\`\n` + changes

      Logs.log({
        client,
        guild: newChannel.guildId,
        title: 'Channel update',
        url: newChannel.url,
        color: Colors.logsGuild,
        description: changes,
      })
    }
  }
}