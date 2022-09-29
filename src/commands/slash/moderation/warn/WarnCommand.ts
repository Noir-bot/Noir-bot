import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10'
import { ButtonInteraction, ChatInputCommandInteraction, GuildMember, User } from 'discord.js'
import Colors from '../../../../constants/Colors'
import NoirClient from '../../../../structures/Client'
import ChatCommand from '../../../../structures/commands/ChatCommand'
import WarnConfirmation from './WarnConfirmation'
import WarnModify from './WarnModify'

export default class WarnCommand extends ChatCommand {
  constructor(client: NoirClient) {
    super(
      client,
      {
        permissions: ['SendMessages', 'EmbedLinks', 'ManageWebhooks'],
        access: 'public',
        type: 'public',
        status: true
      },
      {
        name: 'warn',
        description: 'Warn rulebreakers',
        defaultMemberPermissions: ['ModerateMembers'],
        type: ApplicationCommandType.ChatInput,
        dmPermission: false,
        options: [
          {
            name: 'user',
            description: 'User to warn',
            type: ApplicationCommandOptionType.User,
            required: true
          },
          {
            name: 'reason',
            description: 'Warn reason',
            type: ApplicationCommandOptionType.String
          }
        ]
      }
    )
  }

  public async execute(client: NoirClient, interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser('user', true)
    const member = interaction.options.getMember('user') as GuildMember
    const reason = interaction.options.getString('reason')
    const errors = await this.handleErrors(client, interaction, user, member, reason)

    if (!errors) return

    WarnConfirmation.confirmationMessage(client, interaction, user, reason)
  }

  public async handleErrors(client: NoirClient, interaction: ChatInputCommandInteraction, user: User, member: GuildMember | null, reason: string | null) {
    const command = `</warn:${interaction.commandId}>`

    if (!user.id) {
      await client.reply.reply({
        interaction: interaction,
        color: Colors.warning,
        author: 'User error',
        description: `Undefined user. ${command}`,
        ephemeral: true
      })
    }

    if (user.bot) {
      await client.reply.reply({
        interaction: interaction,
        color: Colors.warning,
        author: 'User error',
        description: `Bot can not be warned. ${command}`,
        ephemeral: true
      })

      return false
    }

    if (user.id == interaction.user.id) {
      await client.reply.reply({
        interaction: interaction,
        color: Colors.warning,
        author: 'User error',
        description: `${interaction.user.username} you can not warn yourself. ${command}`,
        ephemeral: true
      })

      return false
    }

    if (member && member.roles.highest.rawPosition >= (interaction.member as GuildMember).roles.highest.rawPosition) {
      await client.reply.reply({
        interaction: interaction,
        color: Colors.warning,
        author: 'Permission error',
        description: `${interaction.user.username} you can not warn member with higher role than yours. ${command}`,
        ephemeral: true
      })

      return false
    }

    if (interaction.guild?.ownerId == user.id) {
      await client.reply.reply({
        interaction: interaction,
        color: Colors.warning,
        author: 'Permission error',
        description: `${interaction.user.username} can not warn server owner. ${command}`,
        ephemeral: true
      })

      return false
    }

    if (member && !member.moderatable || member && !member.manageable || member && !member.kickable) {
      await client.reply.reply({
        interaction: interaction,
        color: Colors.warning,
        author: 'Permission error',
        description: `${member.user.username} can not be warned. ${command}`,
        ephemeral: true
      })

      return false
    }

    if (reason && reason?.length > 500) {
      await client.reply.reply({
        interaction: interaction,
        color: Colors.warning,
        author: 'Reason error',
        description: `Reason can not be longer than 500 characters. ${command}`,
        ephemeral: true
      })

      return false
    }

    return true
  }

  public static async buttonResponse(client: NoirClient, interaction: ButtonInteraction) {
    const parts = interaction.customId.split('-')
    const id = parseInt(parts[1])
    const method = parts[2]

    if (method == 'cancel') {
      await WarnConfirmation.cancelResponse(client, interaction)
    }

    else if (method == 'confirm') {
      await WarnConfirmation.confirmResponse(client, interaction, id)
    }

    else if (method == 'remove') {
      await WarnModify.removeResponse(client, interaction, id)
    }

    else if (method == 'edit') {

    }
  }
}