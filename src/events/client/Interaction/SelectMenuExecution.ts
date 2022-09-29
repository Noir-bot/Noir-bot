import { SelectMenuInteraction } from 'discord.js'
import SettingsResponses from '../../../commands/slash/utilities/settings/SettingsResponses'
import NoirClient from '../../../structures/Client'

export default class SelectMenuExecution {
  public static async selectMenu(client: NoirClient, interaction: SelectMenuInteraction): Promise<void> {
    const parts = interaction.customId.split('-')
    const name = parts[0].toLowerCase()

    if (name == 'settings') await SettingsResponses.selectResponse(client, interaction)
  }
}