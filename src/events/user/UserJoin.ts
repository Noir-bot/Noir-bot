import { ActionRowBuilder, ButtonBuilder, ButtonStyle, GuildMember, MessageActionRowComponentBuilder, time } from 'discord.js'
import WelcomeHelper from '../../commands/slash/utilities/settings/welcome/WelcomeHelper'
import Client from '../../structures/Client'
import Event from '../../structures/Event'
import WelcomeMessage from '../../structures/WelcomeMessage'
import Welcome from '../../structures/welcome/Welcome'

export default class UserJoin extends Event {
  constructor(client: Client) {
    super(client, 'guildMemberAdd', false)
  }

  public async execute(client: Client, member: GuildMember) {
    const welcomeData = await Welcome.cache(client, member.guild.id)

    if (welcomeData?.roles) {
      await member.roles.add(welcomeData.roles)
    }

    if (welcomeData.restore) {
      const roles = await client.prisma.welcomeRestore.findFirst({
        where: {
          guild: member.guild.id,
          user: member.user.id
        }
      })

      if (roles) {
        await member.roles.add(roles.roles)
        await client.prisma.welcomeRestore.deleteMany({
          where: {
            guild: member.guild.id,
            user: member.user.id
          }
        })
      }
    }

    if (!welcomeData.status) return
    if (!welcomeData.webhook) return

    const webhook = await Welcome.getWebhook(client, welcomeData.webhook)
    const data = { guild: { name: member.guild.name, icon: member.guild.iconURL(), members: member.guild.memberCount, createdAt: time(member.guild.createdTimestamp, 'd'), created: time(member.guild.createdTimestamp, 'R') }, user: { name: member.user.username, avatar: member.user.avatarURL(), createdAt: time(member.user.createdTimestamp, 'd'), created: time(member.user.createdTimestamp, 'R') }, client: { name: client.user?.username, avatar: client.user?.avatarURL() } }

    if (webhook) {
      const messageData = await WelcomeMessage.cache(client, member.guild.id, 'guild_join')

      if (messageData) {
        await WelcomeHelper.send(messageData, data, webhook)
      }
    }

    const messageData = await WelcomeMessage.cache(client, member.guild.id, 'direct_join')

    if (messageData) {
      const serverInvite = client.guilds.cache.get(welcomeData.guild)?.invites.cache.first()?.url
      const button = new ButtonBuilder().setCustomId(`sentFrom-${member.guild.id}`).setLabel(`Sent from ${member.guild.name}`)

      if (serverInvite) {
        button.setDisabled(false)
          .setStyle(ButtonStyle.Link)
          .setURL(serverInvite)
      }

      else {
        button.setDisabled(true)
          .setStyle(ButtonStyle.Secondary)
      }

      const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([button])

      await WelcomeHelper.send(messageData, data, member.user, actionRow)
    }
  }
}