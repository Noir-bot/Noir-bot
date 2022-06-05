import {
  ContextMenuCommandInteraction, MessageApplicationCommandData, UserApplicationCommandData
} from 'discord.js'
import NoirClient from '../Client'
import NoirCommand, {
  NoirCommandSettings
} from './Command'

export default abstract class NoirContextMenuCommand extends NoirCommand {
  public settings: NoirCommandSettings
  public data: MessageApplicationCommandData | UserApplicationCommandData

  constructor(client: NoirClient, settings: NoirCommandSettings, data: MessageApplicationCommandData | UserApplicationCommandData) {
    super(
      client,
    )
    this.settings = settings
    this.data = data
  }

  public abstract execute(client: NoirClient, interaction: ContextMenuCommandInteraction): void
}