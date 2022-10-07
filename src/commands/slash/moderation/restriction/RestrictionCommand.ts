import { Duration } from '@sapphire/time-utilities'
import { ApplicationCommandOptionType, ApplicationCommandType, ButtonInteraction, ChatInputCommandInteraction, GuildMember, User } from 'discord.js'
import Colors from '../../../../constants/Colors'
import NoirClient from '../../../../structures/Client'
import ChatCommand from '../../../../structures/commands/ChatCommand'
import RestrictionConfirmation from './RestrictionConfirmation'

export default class RestrictionCommand extends ChatCommand {
  constructor(client: NoirClient) {
    super(
      client,
      {
        permissions: ['ModerateMembers', 'EmbedLinks', 'SendMessages'],
        access: 'public',
        type: 'public',
        status: true
      },
      {
        name: 'restrict',
        description: 'Temporarily restrict user',
        defaultMemberPermissions: ['SendMessages', 'EmbedLinks', 'ModerateMembers'],
        type: ApplicationCommandType.ChatInput,
        dmPermission: false,
        options: [
          {
            name: 'user',
            description: 'User to restrict',
            type: ApplicationCommandOptionType.User,
            required: true
          },
          {
            name: 'duration',
            description: 'Restriction duration, up to 28 days',
            type: ApplicationCommandOptionType.String,
            required: true
          },
          {
            name: 'reason',
            description: 'Restriction reason',
            type: ApplicationCommandOptionType.String,

          }
        ]
      }
    )
  }

  public async execute(client: NoirClient, interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser('user', true)
    const member = interaction.options.getMember('user') as GuildMember
    const duration = interaction.options.getString('duration', true)
    const reason = interaction.options.getString('reason')
    const errors = await this.handleErrors(client, interaction, user, member, duration)

    if (!errors) return
  }

  public async handleErrors(client: NoirClient, interaction: ChatInputCommandInteraction, user: User, member: GuildMember | null, duration: string) {
    const command = `</restrict:${interaction.commandId}>`

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
        description: `Bot can not be restricted. ${command}`,
        ephemeral: true
      })

      return false
    }

    if (user.id == interaction.user.id) {
      await client.reply.reply({
        interaction: interaction,
        color: Colors.warning,
        author: 'User error',
        description: `${interaction.user.username} you can not restrict yourself. ${command}`,
        ephemeral: true
      })

      return false
    }

    if (member && member.roles.highest.rawPosition >= (interaction.member as GuildMember).roles.highest.rawPosition) {
      await client.reply.reply({
        interaction: interaction,
        color: Colors.warning,
        author: 'Permission error',
        description: `${interaction.user.username} you can not restrict member with higher role than yours. ${command}`,
        ephemeral: true
      })

      return false
    }

    if (interaction.guild?.ownerId == user.id) {
      await client.reply.reply({
        interaction: interaction,
        color: Colors.warning,
        author: 'Permission error',
        description: `${interaction.user.username} can not restrict server owner. ${command}`,
        ephemeral: true
      })

      return false
    }

    if (member && !member.moderatable || member && !member.manageable || member && !member.kickable) {
      await client.reply.reply({
        interaction: interaction,
        color: Colors.warning,
        author: 'Permission error',
        description: `${member.user.username} can not be restricted. ${command}`,
        ephemeral: true
      })

      return false
    }

    if (member?.communicationDisabledUntilTimestamp) {
      await client.reply.reply({
        interaction: interaction,
        color: Colors.warning,
        author: 'Restriction error',
        description: `${member.user.username} is already restricted. ${command}`,
        ephemeral: true
      })

      return false
    }

    if (new Duration(duration).offset < 1) {
      await client.reply.reply({
        interaction: interaction,
        color: Colors.warning,
        author: 'Restriction error',
        description: `Incorrect duration format. ${command}`,
        fields: [
          {
            name: 'Duration examples',
            value: '`1h10m` 1 hour 10 minutes\n`1d10s` 1 day 10 seconds\n`15m` 15 minutes',
            inline: false
          }
        ],
        ephemeral: true
      })

      return false
    }

    return true
  }

  public async buttonResponse(client: NoirClient, interaction: ButtonInteraction) {
    const parts = interaction.customId.split('-')
    const id = parseInt(parts[1])
    const method = parts[2]

    if (method == 'cancel') {
      await RestrictionConfirmation.cancelResponse(client, interaction)
    }

    else if (method == 'confirm') {
      await RestrictionConfirmation.confirmResponse(client, interaction, id)
    }
  }
}