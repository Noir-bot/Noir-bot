import Colors from '@constants/Colors'
import Reply from '@helpers/Reply'
import Utils from '@helpers/Utils'
import Client from '@structures/Client'
import ChatCommand from '@structures/commands/ChatCommand'
import { AccessType, CommandType } from '@structures/commands/Command'
import { ApplicationCommandType } from 'discord-api-types/v10'
import { ChatInputCommandInteraction } from 'discord.js'

export default class MaintenanceCommand extends ChatCommand {
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
        name: 'stats',
        description: 'Noir dev stats',
        type: ApplicationCommandType.ChatInput,
        dmPermission: true,
      }
    )
  }

  public async execute(client: Client, interaction: ChatInputCommandInteraction) {
    const description = `Server Count: ${client.guilds.cache.size}\n` +
      `Users count: \`${client.users.cache.size}\`\n` +
      `Channels count: \`${client.channels.cache.size}\`\n` +
      `Memory usage: \`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}/${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB\`\n`

    Reply.reply({
      client,
      interaction,
      author: 'Noir statistics',
      authorImage: client.user?.displayAvatarURL(),
      color: Colors.primary,
      description,
      footer: `Uptime: ${Utils.formatTime(client.uptime as number)}`
    })
  }
}
