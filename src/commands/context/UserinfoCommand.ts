import UserinfoCommand from '@commands/slash/utilities/Userinfo'
import Client from '@structures/Client'
import { AccessType, CommandType } from '@structures/commands/Command'
import ContextMenuCommand from '@structures/commands/ContextMenuCommand'
import { ApplicationCommandType, ContextMenuCommandInteraction } from 'discord.js'

export default class UserInfoContext extends ContextMenuCommand {
  constructor(client: Client) {
    super(
      client,
      {
        permissions: ['SendMessages'],
        access: AccessType.Public,
        type: CommandType.Public,
        status: true
      },
      {
        name: 'get info',
        type: ApplicationCommandType.User,
        dmPermission: false
      }
    )
  }

  public async execute(client: Client, interaction: ContextMenuCommandInteraction<'cached'>) {
    const user = interaction.options.getMember('user')

    if (!user) return

    UserinfoCommand.getInfo(client, interaction, user, undefined, true)
  }
}