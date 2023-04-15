import InfractionsCommand from '@commands/slash/moderation/infractions/Infractions'
import SettingsResponses from '@commands/slash/utilities/settings/SettingsResponses'
import Client from '@structures/Client'
import { ModalMessageModalSubmitInteraction } from 'discord.js'

export default class ModalExecution {
  public static async messageModal(client: Client, interaction: ModalMessageModalSubmitInteraction): Promise<void> {
    const parts = interaction.customId.split('-')
    const name = parts[0].toLowerCase()

    if (name == 'settings' && interaction.inCachedGuild()) await SettingsResponses.modal(client, interaction)
    else if (name == 'infractions' && interaction.inCachedGuild()) await InfractionsCommand.modal(client, interaction)
  }
}