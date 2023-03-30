import Reply from '@helpers/Reply'
import Client from '@structures/Client'
import ChatCommand from '@structures/commands/ChatCommand'
import { AccessType, CommandType } from '@structures/commands/Command'
import { ApplicationCommandType, ChatInputCommandInteraction } from 'discord.js'

export default class RulesCommand extends ChatCommand {
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
        name: 'info',
        description: 'Send server information',
        type: ApplicationCommandType.ChatInput,
        defaultMemberPermissions: 'Administrator',
        dmPermission: false
      }
    )
  }

  public execute(client: Client, interaction: ChatInputCommandInteraction<'cached'>) {
    Reply.sendMessage({
      client,
      channel: interaction.channelId,
      author: interaction.guild.name,
      authorImage: interaction.guild.iconURL() ?? undefined,
      description: `Welcome to official Noir support server. `
    })
  }
}