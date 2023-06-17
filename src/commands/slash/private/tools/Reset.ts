import Colors from '@constants/Colors'
import Options from '@constants/Options'
import ReadyEvent from '@events/client/Ready'
import Reply from '@helpers/Reply'
import Client from '@structures/Client'
import ChatCommand from '@structures/commands/ChatCommand'
import { AccessType, CommandCategory, CommandType } from '@structures/commands/Command'
import { ApplicationCommandType, ChatInputCommandInteraction } from 'discord.js'

export default class Reset extends ChatCommand {
  constructor(client: Client) {
    super(
      client,
      {
        permissions: ['SendMessages'],
        category: CommandCategory.Private,
        access: AccessType.Private,
        type: CommandType.Private,
        status: true
      },
      {
        name: 'reset',
        description: 'Reset commands',
        defaultMemberPermissions: ['Administrator'],
        type: ApplicationCommandType.ChatInput,
      }
    )
  }

  public async execute(client: Client, interaction: ChatInputCommandInteraction<'cached'>) {
    client.application?.commands.set([])
    client.guilds.cache.get(Options.guildId)?.commands.set([])

    await new ReadyEvent(client).execute(client)

    await Reply.reply({
      client,
      interaction,
      author: 'Command restart',
      authorImage: client.user?.displayAvatarURL(),
      color: Colors.primary,
      description: 'All commands have been successfully restarted'
    })
  }
}