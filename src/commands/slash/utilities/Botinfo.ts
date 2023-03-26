import Colors from "@constants/Colors"
import Emojis from '@constants/Emojis'
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
    const uptime = client.uptime ? parseInt((Date.now() - client.uptime).toString().slice(0, -3)) : undefined

    const fields: EmbedField[] = [
      {
        name: `${Emojis.closeDoor} Servers count`,
        value: `${client.guilds.cache.size}`,
        inline: true
      },
      {
        name: `${Emojis.user} Users`,
        value: `${client.users.cache.size}`,
        inline: true
      },
      {
        name: `${Emojis.channel} Channels`,
        value: `${client.channels.cache.size}`,
        inline: true
      },
      {
        name: `${Emojis.time} Uptime`,
        value: `${uptime ? time(uptime, 'R') : '\`Unexpected error\`'}`,
        inline: true
      },
      {
        name: `${Emojis.slider} Memory usage`,
        value: `\`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\``,
        inline: true
      },
      {
        name: `${Emojis.chain} Version`,
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
      color: Colors.primary,
      thumbnail: client.user?.displayAvatarURL(),
      footer: `© 2023 | Created by ${client.users.cache.get(Options.owners[0])?.tag} `
    })
  }
}