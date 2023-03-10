import { GuildMember, time } from 'discord.js'
import WelcomeHelper from '../../commands/slash/utilities/settings/welcome/WelcomeHelper'
import Client from '../../structures/Client'
import Event from '../../structures/Event'
import WelcomeMessage from '../../structures/WelcomeMessage'
import Welcome from '../../structures/welcome/Welcome'

export default class UserJoin extends Event {
  constructor(client: Client) {
    super(client, 'guildMemberRemove', false)
  }

  public async execute(client: Client, member: GuildMember) {
    const welcomeData = await Welcome.cache(client, member.guild.id)

    if (member.roles.cache.size > 0) {
      const roles = member.roles.cache.map(role => role.id).filter(role => !welcomeData.roles?.includes(role))

      if (roles.length == 0) return

      await client.prisma.welcomeRestore.create({
        data: {
          guild: member.guild.id,
          user: member.id,
          roles: roles
        }
      })
    }

    if (!welcomeData.status) return
    if (!welcomeData.webhook) return

    const webhook = await Welcome.getWebhook(client, welcomeData.webhook)
    const data = { guild: { name: member.guild.name, icon: member.guild.iconURL(), members: member.guild.memberCount, createdAt: time(member.guild.createdTimestamp, 'd'), created: time(member.guild.createdTimestamp, 'R') }, user: { name: member.user.username, avatar: member.user.avatarURL(), createdAt: time(member.user.createdTimestamp, 'd'), created: time(member.user.createdTimestamp, 'R') }, client: { name: client.user?.username, avatar: client.user?.avatarURL() } }

    if (!webhook) return

    const messageData = await WelcomeMessage.cache(client, member.guild.id, 'guild_left')

    if (messageData) {
      await WelcomeHelper.send(messageData, data, webhook)
    }
  }
}