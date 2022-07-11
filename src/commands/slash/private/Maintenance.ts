import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10'
import { ActivityType, ChatInputCommandInteraction } from 'discord.js'
import Colors from '../../../constants/Colors'
import Options from '../../../constants/Options'
import NoirClient from '../../../structures/Client'
import ChatCommand from '../../../structures/command/ChatCommand'

export default class MaintenanceCommand extends ChatCommand {
  constructor(client: NoirClient) {
    super(
      client,
      {
        permissions: ['SendMessages', 'EmbedLinks'],
        access: 'private',
        type: 'private',
        status: true
      },
      {
        name: 'maintenance',
        description: 'Enable premium features for user',
        type: ApplicationCommandType.ChatInput,
        options: [
          {
            name: 'status',
            description: 'Maintenance mode status',
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
    this.presence(client, status)

    await client.reply.reply({
      interaction: interaction,
      color: Colors.success,
      author: 'Maintenance mode',
      description: `Maintenance mode ${status ? 'enabled' : 'disabled'}`
    })
  }

  public presence(client: NoirClient, status: boolean) {
    if (status) {
      client.user?.setActivity({
        name: 'Maintenance mode',
        type: ActivityType.Watching
      })

      client.user?.setStatus('idle')
      return
    } else {
      client.user?.setActivity({
        name: Options.activity,
        type: ActivityType.Listening
      })

      client.user?.setStatus(Options.status)
      return
    }
  }
}