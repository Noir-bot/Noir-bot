import Reply from '@helpers/Reply'
import Client from '@structures/Client'
import ChatCommand from '@structures/commands/ChatCommand'
import { AccessType, CommandType } from '@structures/commands/Command'
import { ApplicationCommandType, CacheType, ChatInputCommandInteraction } from 'discord.js'

export default class VoteCommand extends ChatCommand {
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
        name: 'vote',
        description: 'Vote for Noir',
        type: ApplicationCommandType.ChatInput,
        dmPermission: false,
      }
    )
  }

  public async execute(client: Client, interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
    Reply.reply({
      client,
      interaction,
      author: 'Vote for Noir',
      authorImage: client.user?.displayAvatarURL(),
      description: 'Vote for Noir on [top.gg](https://top.gg/bot/855423971033874462/vote) and help us grow!',
    })
  }
}