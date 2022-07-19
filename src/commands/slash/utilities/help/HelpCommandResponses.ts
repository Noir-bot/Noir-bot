import { ButtonInteraction } from 'discord.js'
import NoirClient from '../../../../structures/Client'
import HelpCommand from './HelpCommand'

export default class HelpCommandResponses {
  public static async button(client: NoirClient, interaction: ButtonInteraction): Promise<void> {
    const parts = interaction.customId.split('-')
    const type = parts[1].toLowerCase()

    if (type == 'faq') await HelpCommand.faqMessage(client, interaction)
    else await HelpCommand.initialMessage(client, interaction)
  }
}