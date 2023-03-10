import Client from '@structures/Client'
import Command, { CommandOptions } from '@structures/commands/Command'
import { ContextMenuCommandInteraction, MessageApplicationCommandData, UserApplicationCommandData } from 'discord.js'

export default abstract class ContextMenuCommand extends Command {
  public options: CommandOptions
  public data: MessageApplicationCommandData | UserApplicationCommandData

  constructor(client: Client, options: CommandOptions, data: MessageApplicationCommandData | UserApplicationCommandData) {
    super(client)
    this.options = options
    this.data = data
  }

  public abstract execute(client: Client, interaction: ContextMenuCommandInteraction): void
}