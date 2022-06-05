import {
  ChatInputApplicationCommandData, ChatInputCommandInteraction
} from 'discord.js'
import NoirClient from '../Client'
import NoirCommand, {
  NoirCommandSettings
} from './Command'

export default abstract class NoirChatCommand extends NoirCommand {
  public settings: NoirCommandSettings
  public data: ChatInputApplicationCommandData

  constructor(client: NoirClient, settings: NoirCommandSettings, data: ChatInputApplicationCommandData) {
    super(
      client,
    )
    this.settings = settings
    this.data = data
  }

  public abstract execute(client: NoirClient, interaction: ChatInputCommandInteraction): void
}