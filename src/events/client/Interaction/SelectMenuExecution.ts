import { SelectMenuInteraction } from 'discord.js'
import EmbedCommandResponses from '../../../commands/slash/utilities/embed/EmbedCommandResponses'
import NoirClient from '../../../structures/Client'

export default class SelectMenuExecution {
  public static async selectMenu(client: NoirClient, interaction: SelectMenuInteraction): Promise<void> {
    const parts = interaction.customId.split('-')
    const name = parts[0].toLowerCase()

    if (name == 'embed') await EmbedCommandResponses.selectMenu(client, interaction)
  }
}