import WarnConfirmation from '@commands/slash/moderation/warn/Confirmation'
import Colors from '@constants/Colors'
import Preferences from '@constants/Preferences'
import Reply from '@helpers/Reply'
import Client from '@structures/Client'
import ChatCommand from '@structures/commands/ChatCommand'
import { AccessType, CommandType } from '@structures/commands/Command'
import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction, GuildMember } from 'discord.js'

export default class WarnCommand extends ChatCommand {
  constructor(client: Client) {
    super(
      client,
      {
        permissions: ['SendMessages', 'EmbedLinks'],
        access: AccessType.Moderation,
        type: CommandType.Public,
        status: true,
        rateLimit: 15
      },
      {
        name: 'warn',
        description: 'Warn a user',
        defaultMemberPermissions: ['ManageMessages', 'SendMessages'],
        options: [
          {
            name: 'user',
            description: 'User to warn',
            type: ApplicationCommandOptionType.User,
            required: true
          },
          {
            name: 'reason',
            description: 'Reason for the warn',
            type: ApplicationCommandOptionType.String,
            max_length: 500,
            required: true
          }
        ],
        type: ApplicationCommandType.ChatInput,
        dmPermission: false,
      }
    )
  }

  public async execute(client: Client, interaction: ChatInputCommandInteraction<'cached'>) {
    const user = interaction.options.getUser('user', true)
    const reason = interaction.options.getString('reason', true)
    const errorStatus = this.errorHandler(client, interaction, interaction.guild.members.cache.get(user.id), reason)

    if (!errorStatus) return

    WarnConfirmation.confirmationMessage(client, interaction, user, reason)

  }

  public errorHandler(client: Client, interaction: ChatInputCommandInteraction<'cached'>, member?: GuildMember, reason?: string) {
    const commandMention = `try again </warn:${client.application?.commands.cache.get('warn')?.id}>`

    if (!member) {
      Reply.reply({
        client,
        interaction: interaction,
        color: Colors.warning,
        author: 'Member error',
        description: `Undefined member, ${commandMention}`,
        ephemeral: true
      })

      return false
    }

    if (member.user.bot) {
      Reply.reply({
        client,
        interaction: interaction,
        color: Colors.warning,
        author: 'Member error',
        description: `You cannot warn a bot, ${commandMention}`,
        ephemeral: true
      })

      return false
    }

    if (!reason) {
      Reply.reply({
        client,
        interaction: interaction,
        color: Colors.warning,
        author: 'Reason error',
        description: `No reason provided, ${commandMention}`,
        ephemeral: true
      })

      return false
    }

    if (member.id == interaction.user.id) {
      Reply.reply({
        client,
        interaction: interaction,
        color: Colors.warning,
        author: 'Member error',
        description: `You cannot warn yourself, ${commandMention}`,
        ephemeral: true
      })

      return false
    }

    if (!member.moderatable) {
      Reply.reply({
        client,
        interaction: interaction,
        color: Colors.warning,
        author: 'Permission error',
        description: `Not enough permission, ${commandMention}`,
        ephemeral: true
      })

      return false
    }

    if (member.roles.highest.rawPosition >= (interaction.member as GuildMember).roles.highest.rawPosition) {
      Reply.reply({
        client,
        interaction: interaction,
        color: Colors.warning,
        author: 'Permission error',
        description: `You don't have enough permission, ${commandMention}`,
        ephemeral: true
      })

      return false
    }

    if (interaction.guild.members.me && !interaction.guild.members.me.roles.cache.size && member.roles.cache.size || interaction.guild.members.me && member.roles.highest.rawPosition >= interaction.guild.members.me.roles.highest.rawPosition) {
      Reply.reply({
        client,
        interaction: interaction,
        color: Colors.warning,
        author: 'Permission error',
        description: `I don't have enough permission, ${commandMention}`,
        ephemeral: true
      })

      return false
    }

    if (reason.length > Preferences.reasonLimit) {
      Reply.reply({
        client,
        interaction: interaction,
        color: Colors.warning,
        author: 'Permission error',
        description: `I don't have enough permission, ${commandMention}`,
        ephemeral: true
      })

      return false
    }

    return true
  }
}
