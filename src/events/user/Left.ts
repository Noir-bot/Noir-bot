import WelcomeHelper from '@commands/slash/utilities/settings/welcome/WelcomeHelper'
import UserKick from '@events/user/Kick'
import Client from '@structures/Client'
import Event from '@structures/Event'
import Welcome from '@structures/welcome/Welcome'
import WelcomeMessage from '@structures/welcome/WelcomeMessage'
import { AuditLogEvent, GuildMember, time } from 'discord.js'

export default class UserJoin extends Event {
  constructor(client: Client) {
    super(client, 'guildMemberRemove', false)
  }

  public async execute(client: Client, member: GuildMember) {
    const auditLogs = await member.guild.fetchAuditLogs({ type: AuditLogEvent.MemberKick, limit: 1 })
    const eventInfo = auditLogs.entries.first()

    if (eventInfo?.targetId == member.id && eventInfo.createdAt.getTime() > new Date().getTime() - 10000) {
      await UserKick.response(client, member, eventInfo)

      return
    }

    const welcomeData = await Welcome.cache(client, member.guild.id)

    if (!welcomeData.status) return

    if (welcomeData.restore) {
      const memberRoles = member.roles.cache

      if (memberRoles.size > 0) {
        const roles = memberRoles.map(role => role.id).filter(role => !welcomeData.roles?.includes(role) && role != member.guild.roles.everyone.id)

        if (!roles || roles.length == 0) return

        await client.prisma.userRestore.create({
          data: {
            guild: member.guild.id,
            user: member.id,
            roles: roles
          }
        })
      }
    }

    if (!welcomeData.status) return
    if (!welcomeData.webhook) return

    const webhook = await Welcome.getWebhook(client, welcomeData.webhook)
    const data = { guild: { name: member.guild.name, icon: member.guild.iconURL(), members: member.guild.memberCount, createdAt: time(member.guild.createdAt, 'd'), created: time(member.guild.createdAt, 'R') }, user: { name: member.user.username, avatar: member.user.avatarURL(), createdAt: time(member.user.createdAt, 'd'), created: time(member.user.createdAt, 'R'), joined: 'Unspecified', joinedAt: 'Unspecified' }, client: { name: client.user?.username, avatar: client.user?.avatarURL() } }
    const imageData = { guild: member.guild.iconURL(), user: member.user.avatarURL(), client: client.user?.avatarURL() }

    if (member.joinedTimestamp) {
      data.user.joinedAt = time(member.joinedTimestamp, 'd')
      data.user.joined = time(member.joinedTimestamp, 'R')
    }

    if (!webhook) return

    const messageData = await WelcomeMessage.cache(client, member.guild.id, 'guild_left', false, true)

    if (messageData) {
      await WelcomeHelper.send(messageData, data, imageData, webhook)
    }
  }
}