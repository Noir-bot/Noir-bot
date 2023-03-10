import HelpCommand from '@commands/slash/utilities/help/HelpCommand'
import Client from '@structures/Client'
import { ButtonInteraction } from 'discord.js'

export default class HelpCommandResponses {
  public static async button(client: Client, interaction: ButtonInteraction): Promise<void> {
    const parts = interaction.customId.split('-')
    const type = parts[1].toLowerCase()

    if (type == 'faq') await HelpCommand.faqMessage(client, interaction)
    else await HelpCommand.initialMessage(client, interaction)
  }
}