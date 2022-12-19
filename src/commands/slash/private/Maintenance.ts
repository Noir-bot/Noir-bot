import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10'
import { ActivityType, ChatInputCommandInteraction } from 'discord.js'
import Colors from '../../../constants/Colors'
import Options from '../../../constants/Options'
import NoirClient from '../../../structures/Client'
import ChatCommand from '../../../structures/commands/ChatCommand'

export default class MaintenanceCommand extends ChatCommand {
  constructor(client: NoirClient) {
    super(
      client,
      {
        permissions: [],
        access: 'private',
        type: 'private',
        status: true
      },
      {
        name: 'maintenance',
        description: 'Maintenance mode',
        type: ApplicationCommandType.ChatInput,
        dmPermission: true,
        options: [
          {
            name: 'status',
            description: 'Current status',
            type: ApplicationCommandOptionType.Boolean,
            required: true
          }
        ]
      }
    )
  }

  public async execute(client: NoirClient, interaction: ChatInputCommandInteraction) {
    const status = interaction.options.getBoolean('status', true)

    Options.maintenance = status
    this.changePresence(client, status)

    await client.reply.reply({
      interaction: interaction,
      color: Colors.primary,
      author: 'Maintenance mode',
      description: `${status ? 'Enabling' : 'Disabling'} maintenance mode`
    })
  }

  public changePresence(client: NoirClient, status: boolean) {
    if (status) {
      client.user?.setActivity({
        name: 'Maintenance mode',
        type: ActivityType.Watching
      })

      client.user?.setStatus('idle')
    }

    else {
      client.user?.setActivity({
        name: Options.activity,
        type: ActivityType.Listening
      })

      client.user?.setStatus(Options.status)
    }
  }
}