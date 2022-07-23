import { ButtonInteraction, ModalMessageModalSubmitInteraction } from 'discord.js'
import NoirClient from '../../../../structures/Client'
import SettingsCommandWelcomeResponses from './welcome/responses/SettingsCommandWelcomeResponse'

export default class SettingsCommandResponses {
  public static async button(client: NoirClient, interaction: ButtonInteraction): Promise<void> {
    const parts = interaction.customId.split('-')
    const method = parts[2]
    const id = parts[1]

    console.log(parts)

    if (method.startsWith('welcome')) {
      SettingsCommandWelcomeResponses.button(client, interaction, parts, method, id)
    }
  }

  public static async modal(client: NoirClient, interaction: ModalMessageModalSubmitInteraction): Promise<void> {
    const parts = interaction.customId.split('-')
    const method = parts[2]
    const id = parts[1]

    if (method.startsWith('welcome')) {
      SettingsCommandWelcomeResponses.modal(client, interaction, parts, method, id)
    }
  }
}