import Client from '@structures/Client'
import ChatCommand from '@structures/commands/ChatCommand'
import { AccessType, CommandCategory, CommandType } from '@structures/commands/Command'
import { ApplicationCommandType, ButtonBuilder, ChatInputCommandInteraction } from 'discord.js'

export default class EmbedCommand extends ChatCommand {
  constructor(client: Client) {
    super(
      client,
      {
        permissions: ['EmbedLinks'],
        category: CommandCategory.Utility,
        access: AccessType.Public,
        type: CommandType.Public,
        status: true,
        development: true
      },
      {
        name: 'embed',
        description: 'Create embed messages',
        defaultMemberPermissions: ['ManageMessages'],
        type: ApplicationCommandType.ChatInput,
        dmPermission: false
      }
    )
  }

  public async execute(client: Client, interaction: ChatInputCommandInteraction<'cached'>): Promise<void> {
    const buttons = [
      new ButtonBuilder()
        .setCustomId('embed-create')

    ]
  }
}