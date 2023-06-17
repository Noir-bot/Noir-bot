import Colors from '@constants/Colors'
import Reply from '@helpers/Reply'
import Client from '@structures/Client'
import ChatCommand from '@structures/commands/ChatCommand'
import { AccessType, CommandCategory, CommandType } from '@structures/commands/Command'
import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction, ContextMenuCommandInteraction, GuildMember } from 'discord.js'

export default class BannerCommand extends ChatCommand {
  constructor(client: Client) {
    super(
      client,
      {
        permissions: ['EmbedLinks'],
        category: CommandCategory.Information,
        access: AccessType.Public,
        type: CommandType.Public,
        status: true
      },
      {
        name: 'banner',
        description: 'Get user banner',
        type: ApplicationCommandType.ChatInput,
        dmPermission: false,
        options: [
          {
            name: 'user',
            description: 'User to get banner',
            type: ApplicationCommandOptionType.User
          },
          // {
          //   name: 'server',
          //   description: 'Get server banner',
          //   type: ApplicationCommandOptionType.Boolean
          // },
          {
            name: 'private',
            description: 'Send banner in private message',
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

    BannerCommand.getInfo(client, interaction, member, ephemeral)
  }

  public static async getInfo(
    client: Client,
    interaction: ChatInputCommandInteraction<'cached'> | ContextMenuCommandInteraction<'cached'>,
    member: GuildMember,
    ephemeral = true
  ) {
    const fetchUser = await member.user.fetch()
    const banner = fetchUser.bannerURL({ size: 4096 })

    if (!banner) {
      Reply.reply({
        client,
        interaction,
        author: 'Banner error',
        authorImage: client.user?.displayAvatarURL(),
        color: Colors.warning,
        description: 'User has no banner'
      })

      return
    }

    Reply.reply({
      client,
      interaction,
      ephemeral,
      content: banner,
    })
  }
}
