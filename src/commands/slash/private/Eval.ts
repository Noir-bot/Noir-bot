import Client from '@structures/Client'
import ChatCommand from '@structures/commands/ChatCommand'
import { AccessType, CommandType } from '@structures/commands/Command'
import { ApplicationCommandType, CacheType, ChatInputCommandInteraction, TextInputBuilder } from 'discord.js'

export default class EvalCommand extends ChatCommand {
  constructor(client: Client) {
    super(
      client,
      {
        permissions: 'Administrator',
        access: AccessType.Private,
        type: CommandType.Private,
        status: true,
      },
      {
        name: 'eval',
        description: 'Evaluate code',
        defaultMemberPermissions: 'Administrator',
        type: ApplicationCommandType.ChatInput,
      }
    )
  }

  public execute(client: Client, interaction: ChatInputCommandInteraction<CacheType>): void {
    const codeInput = new TextInputBuilder()
  }
}
