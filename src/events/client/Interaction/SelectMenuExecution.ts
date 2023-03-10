import SettingsResponses from '@commands/slash/utilities/settings/SettingsResponses'
import Client from '@structures/Client'
import { AnySelectMenuInteraction } from 'discord.js'

export default class SelectMenuExecution {
  public static async selectMenu(client: Client, interaction: AnySelectMenuInteraction) {
    const parts = interaction.customId.split('-')
    const name = parts[0].toLowerCase()

    if (name == 'settings' && interaction.inCachedGuild()) await SettingsResponses.select(client, interaction)
  }
}