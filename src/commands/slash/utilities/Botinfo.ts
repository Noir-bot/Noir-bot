import Colors from "@constants/Colors"
import Options from '@constants/Options'
import Reply from "@helpers/Reply"
import Client from "@structures/Client"
import ChatCommand from "@structures/commands/ChatCommand"
import { AccessType, CommandType } from '@structures/commands/Command'
import { ApplicationCommandType } from 'discord-api-types/v10'
import { ChatInputCommandInteraction, EmbedField, time } from "discord.js"

const pkg = require('../../../../package.json')

export default class Botinfo extends ChatCommand {
  constructor(client: Client) {
    super(
      client,
      {
        permissions: [],
        access: AccessType.Public,
        type: CommandType.Public,
        status: true
      },
      {
        name: 'botinfo',
        description: 'Bot information',
        type: ApplicationCommandType.ChatInput,
        dmPermission: false,
      }
    )
  }

  public execute(client: Client, interaction: ChatInputCommandInteraction<'cached'>) {
    const timeMS = client.uptime ? parseInt((new Date().getTime() + client.uptime).toString().slice(0, -3)) : undefined

    const fields: EmbedField[] = [
      {
        name: 'Servers count',
        value: `${client.guilds.cache.size}`,
        inline: true
      },
      {
        name: 'Users count',
        value: `${client.users.cache.size}`,
        inline: true
      },
      {
        name: 'Channels count',
        value: `${client.channels.cache.size}`,
        inline: true
      },
      {
        name: 'Uptime',
        value: `${timeMS ? time(timeMS, 'R') : '\`Unexpected error\`'}`,
        inline: true
      },
      {
        name: 'Memory usage',
        value: `\`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\``,
        inline: true
      },
      {
        name: 'Noir version',
        value: `\`v${pkg.version} beta\``,
        inline: true
      }
    ]

    Reply.reply({
      client,
      interaction,
      author: 'Bot Information',
      authorImage: client.user?.displayAvatarURL(),
      fields: fields,
      color: Colors.information,
      thumbnail: client.user?.displayAvatarURL(),
      footer: `© 2023 | Created by ${client.users.cache.get(Options.owners[0])?.tag} `
    })
  }
}