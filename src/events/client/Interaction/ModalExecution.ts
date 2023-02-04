import { ModalMessageModalSubmitInteraction } from 'discord.js'
import WarnEdit from '../../../commands/slash/moderation/warn/Edit'
import SettingsResponses from '../../../commands/slash/utilities/settings/SettingsResponses'
import NoirClient from '../../../structures/Client'

export default class ModalExecution {
  public static async messageModal(client: NoirClient, interaction: ModalMessageModalSubmitInteraction): Promise<void> {
    const parts = interaction.customId.split('-')
    const name = parts[0].toLowerCase()

    if (name == 'settings' && interaction.inCachedGuild()) await SettingsResponses.modal(client, interaction)
    else if (name == 'warn') await WarnEdit.modalResponse(client, interaction)
  }
}