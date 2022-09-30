import { ModalMessageModalSubmitInteraction } from 'discord.js'
import WarnCommand from '../../../commands/slash/moderation/warn/WarnCommand'
import SettingsResponses from '../../../commands/slash/utilities/settings/SettingsResponses'
import NoirClient from '../../../structures/Client'

export default class ModalExecution {
  public static async messageModal(client: NoirClient, interaction: ModalMessageModalSubmitInteraction): Promise<void> {
    const parts = interaction.customId.split('-')
    const name = parts[0].toLowerCase()

    if (name == 'settings') await SettingsResponses.modalResponse(client, interaction)
    else if (name == 'warn') await WarnCommand.modalResponse(client, interaction)
  }
}