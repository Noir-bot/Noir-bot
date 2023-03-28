import Colors from '@constants/Colors'
import Reply from '@helpers/Reply'
import Client from '@structures/Client'
import ChatCommand from '@structures/commands/ChatCommand'
import { AccessType, CommandType } from '@structures/commands/Command'
import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction, ContextMenuCommandInteraction, GuildMember, User, userMention } from 'discord.js'

export default class AvatarCommand extends ChatCommand {
  constructor(client: Client) {
    super(
      client,
      {
        permissions: ['EmbedLinks'],
        access: AccessType.Public,
        type: CommandType.Public,
        status: true
      },
      {
        name: 'avatar',
        description: 'Get user avatar',
        type: ApplicationCommandType.ChatInput,
        dmPermission: false,
        options: [
          {
            name: 'user',
            description: 'User to get avatar',
            type: ApplicationCommandOptionType.User
          },
          {
            name: 'server',
            description: 'Get server avatar',
            type: ApplicationCommandOptionType.Boolean
          },
          {
            name: 'target',
            description: 'Mention user to get avatar for him',
            type: ApplicationCommandOptionType.User,
            required: false
          },
          {
            name: 'private',
            description: 'Send avatar in private message',
            type: ApplicationCommandOptionType.Boolean,
            required: false
          }
        ]
      }
    )
  }

  public async execute(client: Client, interaction: ChatInputCommandInteraction<'cached'>) {
    const member = interaction.options.getMember('user') ?? interaction.member
    const ephemeral = interaction.options.getBoolean('private') ?? true
    const server = interaction.options.getBoolean('server') ?? false
    const target = interaction.options.getUser('target')

    AvatarCommand.getInfo(client, interaction, member, target, server, ephemeral)
  }

  public static async getInfo(
    client: Client,
    interaction: ChatInputCommandInteraction<'cached'> | ContextMenuCommandInteraction<'cached'>,
    member: GuildMember,
    target?: User | null,
    server = false,
    ephemeral = true
  ) {
    const avatar = server ? member.displayAvatarURL({ size: 4096 }) : member.user.displayAvatarURL({ size: 4096 })
    const color = member.user.accentColor ?? (await member.user.fetch()).accentColor

    Reply.reply({
      client,
      interaction,
      ephemeral,
      content: target ? `Avatar for ${userMention(target.id)}` : undefined,
      author: `${member.user.username}'s avatar`,
      color: color ?? Colors.primary,
      image: avatar,
    })
  }
}
