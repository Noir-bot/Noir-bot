import { AnySelectMenuInteraction } from 'discord.js'
import SettingsResponses from '../../../commands/slash/utilities/settings/SettingsResponses'
import NoirClient from '../../../structures/Client'

export default class SelectMenuExecution {
  public static async selectMenu(client: NoirClient, interaction: AnySelectMenuInteraction) {
    const parts = interaction.customId.split('-')
    const name = parts[0].toLowerCase()

    if (name == 'settings' && interaction.inCachedGuild()) await SettingsResponses.select(client, interaction)
  }
}