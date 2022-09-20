import { ButtonInteraction, ModalMessageModalSubmitInteraction, SelectMenuInteraction } from 'discord.js'
import NoirClient from '../../../../../structures/Client'
import SettingsCommandWelcomeResponses from './SettingsCommandWelcomeResponses'

export default class SettingsCommandResponses {
  public static async button(client: NoirClient, interaction: ButtonInteraction): Promise<void> {
    const parts = interaction.customId.split('-')
    const method = parts[2]

    if (method.startsWith('welcome')) {
      await SettingsCommandWelcomeResponses.button(client, interaction, parts)
    }

    console.log(parts)
  }

  public static async modal(client: NoirClient, interaction: ModalMessageModalSubmitInteraction): Promise<void> {
    const parts = interaction.customId.split('-')
    const method = parts[2]

    if (method.startsWith('welcome')) {
      await SettingsCommandWelcomeResponses.modal(client, interaction, parts)
    }
  }

  public static async selectMenu(client: NoirClient, interaction: SelectMenuInteraction): Promise<void> {
    const parts = interaction.customId.split('-')
    const method = parts[2]

    if (method.startsWith('welcome')) {
      await SettingsCommandWelcomeResponses.selectMenu(client, interaction, parts)
    }
  }
}