import { ChatInputApplicationCommandData, ChatInputCommandInteraction } from 'discord.js'
import NoirClient from '../Client'
import NoirCommand, { CommandOptions } from './Command'

export default abstract class ChatCommand extends NoirCommand {
  public options: CommandOptions
  public data: ChatInputApplicationCommandData

  constructor(client: NoirClient, options: CommandOptions, data: ChatInputApplicationCommandData) {
    super(client)
    this.options = options
    this.data = data
  }

  public abstract execute(client: NoirClient, interaction: ChatInputCommandInteraction): void
}