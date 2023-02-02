import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction, GuildMember } from 'discord.js'
import Colors from '../../../../constants/Colors'
import Options from '../../../../constants/Options'
import NoirClient from '../../../../structures/Client'
import ChatCommand from '../../../../structures/commands/ChatCommand'

export default class WarnCommand extends ChatCommand {
  constructor(client: NoirClient) {
    super(
      client,
      {
        permissions: ['SendMessages', 'EmbedLinks'],
        access: 'moderation',
        type: 'public',
        status: true
      },
      {
        name: 'warn',
        description: 'Warn a user',
        defaultMemberPermissions: ['ManageMessages', 'SendMessages'],
        options: [
          {
            name: 'user',
            description: 'The user to warn',
            type: ApplicationCommandOptionType.User,
            required: true
          },
          {
            name: 'reason',
            description: 'The reason for the warn',
            type: ApplicationCommandOptionType.String,
            required: true
          }
        ],
        type: ApplicationCommandType.ChatInput,
        dmPermission: false,
      }
    )
  }

  public async execute(client: NoirClient, interaction: ChatInputCommandInteraction<'cached'>) {
    const user = interaction.options.getUser('user', true)
    const reason = interaction.options.getString('reason', true)
    const errorStatus = this.errorHandler(client, interaction, interaction.guild.members.cache.get(user.id), reason)

    if (!errorStatus) return
  }

  public errorHandler(client: NoirClient, interaction: ChatInputCommandInteraction<'cached'>, member?: GuildMember, reason?: string) {
    const commandMention = `try again </warn:${client.application?.commands.cache.get('warn')?.id}>`

    if (!member) {
      client.reply.reply({
        interaction: interaction,
        color: Colors.warning,
        author: 'Member error',
        description: `Undefined member, ${commandMention}`,
        ephemeral: true
      })

      return false
    }

    if (member.user.bot) {
      client.reply.reply({
        interaction: interaction,
        color: Colors.warning,
        author: 'Member error',
        description: `You cannot warn a bot, ${commandMention}`,
        ephemeral: true
      })

      return false
    }

    if (!reason) {
      client.reply.reply({
        interaction: interaction,
        color: Colors.warning,
        author: 'Reason error',
        description: `No reason provided, ${commandMention}`,
        ephemeral: true
      })

      return false
    }

    if (member.id == interaction.user.id) {
      client.reply.reply({
        interaction: interaction,
        color: Colors.warning,
        author: 'Member error',
        description: `You cannot warn yourself, ${commandMention}`,
        ephemeral: true
      })

      return false
    }

    if (member.moderatable) {
      client.reply.reply({
        interaction: interaction,
        color: Colors.warning,
        author: 'Permission error',
        description: `Not enough permission, ${commandMention}`,
        ephemeral: true
      })

      return false
    }

    if (member.roles.highest.rawPosition >= (interaction.member as GuildMember).roles.highest.rawPosition) {
      client.reply.reply({
        interaction: interaction,
        color: Colors.warning,
        author: 'Permission error',
        description: `You don't have enough permission, ${commandMention}`,
        ephemeral: true
      })

      return false
    }

    if (interaction.guild.members.me && !interaction.guild.members.me.roles.cache.size && member.roles.cache.size || interaction.guild.members.me && member.roles.highest.rawPosition >= interaction.guild.members.me.roles.highest.rawPosition) {
      client.reply.reply({
        interaction: interaction,
        color: Colors.warning,
        author: 'Permission error',
        description: `I don't have enough permission, ${commandMention}`,
        ephemeral: true
      })

      return false
    }

    if (reason.length > Options.reasonLimit) {
      client.reply.reply({
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