import { ModalMessageModalSubmitInteraction } from 'discord.js'
import EmbedCommandResponses from '../../../commands/slash/utilities/embed/EmbedCommandResponses'
import SettingsResponse from '../../../commands/slash/utilities/settings/SettingsCommandResponses'
import NoirClient from '../../../structures/Client'

export default class ModalExecution {
  public static async messageModal(client: NoirClient, interaction: ModalMessageModalSubmitInteraction): Promise<void> {
    const parts = interaction.customId.split('-')
    const name = parts[0].toLowerCase()

    if (name == 'embed') await EmbedCommandResponses.modal(client, interaction)
    else if (name == 'settings') await SettingsResponse.modal(client, interaction)
  }
}