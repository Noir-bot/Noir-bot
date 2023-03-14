import Colors from '@constants/Colors'
import Options from '@constants/Options'
import Client from '@structures/Client'
import ChatCommand from '@structures/commands/ChatCommand'
import { AccessType, CommandType } from '@structures/commands/Command'
import { ApplicationCommandType } from 'discord-api-types/v10'
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js'
import Reply from '../../../helpers/Reply'

export default class DeleteCommand extends ChatCommand {
  constructor(client: Client) {
    super(
      client,
      {
        permissions: [],
        access: AccessType.Private,
        type: CommandType.Private,
        status: true
      },
      {
        name: 'delete',
        description: 'Delete command',
        type: ApplicationCommandType.ChatInput,
        dmPermission: false,
        options: [
          {
            name: 'command',
            description: 'Command name to delete',
            type: ApplicationCommandOptionType.String,
            required: true
          }
        ]
      }
    )
  }


  public async execute(client: Client, interaction: ChatInputCommandInteraction<'cached'>) {
    const commandId = interaction.options.getString('command', true)
    const command = await client.application?.commands.fetch(commandId) || await client.guilds.cache.get(Options.guildId)?.commands.fetch(commandId)

    console.log(command?.name)

    if (!command) return

    await command?.delete()

    await Reply.reply({
      client,
      interaction,
      color: Colors.primary,
      description: `\`${command?.name}\` command successfully deleted`
    })
  }
}