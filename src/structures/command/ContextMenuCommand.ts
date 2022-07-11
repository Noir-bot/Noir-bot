import { ContextMenuCommandInteraction, MessageApplicationCommandData, UserApplicationCommandData } from 'discord.js'
import NoirClient from '../Client'
import Command, { CommandOptions } from './Command'

export default abstract class ContextMenuCommand extends Command {
  public options: CommandOptions
  public data: MessageApplicationCommandData | UserApplicationCommandData

  constructor(client: NoirClient, options: CommandOptions, data: MessageApplicationCommandData | UserApplicationCommandData) {
    super(client)
    this.options = options
    this.data = data
  }

  public abstract execute(client: NoirClient, interaction: ContextMenuCommandInteraction): void
}