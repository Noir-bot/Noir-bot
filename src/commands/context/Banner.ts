import BannerCommand from '@commands/slash/utilities/information/Banner'
import Client from '@structures/Client'
import { AccessType, CommandType } from '@structures/commands/Command'
import ContextMenuCommand from '@structures/commands/ContextMenuCommand'
import { ApplicationCommandType, ContextMenuCommandInteraction } from 'discord.js'

export default class AvatarContext extends ContextMenuCommand {
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
        name: 'get banner',
        type: ApplicationCommandType.User,
        dmPermission: false
      }
    )
  }

  public async execute(client: Client, interaction: ContextMenuCommandInteraction<'cached'>) {
    const user = interaction.options.getMember('user')

    if (!user) return

    BannerCommand.getInfo(client, interaction, user)
  }
}