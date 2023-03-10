import Client from '@structures/Client'
import NoirCommand, { CommandOptions } from '@structures/commands/Command'
import { ChatInputApplicationCommandData, ChatInputCommandInteraction } from 'discord.js'

export default abstract class ChatCommand extends NoirCommand {
  public options: CommandOptions
  public data: ChatInputApplicationCommandData

  constructor(client: Client, options: CommandOptions, data: ChatInputApplicationCommandData) {
    super(client)
    this.options = options
    this.data = data
  }

  public abstract execute(client: Client, interaction: ChatInputCommandInteraction): void
}