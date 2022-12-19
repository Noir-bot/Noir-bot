import { AnySelectMenuInteraction, ButtonInteraction, ModalMessageModalSubmitInteraction } from 'discord.js'
import NoirClient from '../../../../structures/Client'
import ModerationResponse from './moderation/ModerationResponse'
import WelcomeResponse from './welcome/WelcomeResponses'

export default class SettingsResponses {
  public static async button(client: NoirClient, interaction: ButtonInteraction<'cached'>) {
    const parts = interaction.customId.split('-')
    const method = parts[2]

    if (method.startsWith('welcome')) {
      await WelcomeResponse.buttonResponse(client, interaction, parts)
    }

    else if (method.startsWith('moderation')) {
      await ModerationResponse.buttonResponse(client, interaction, parts)
    }
  }

  public static async modal(client: NoirClient, interaction: ModalMessageModalSubmitInteraction<'cached'>) {
    const parts = interaction.customId.split('-')
    const method = parts[2]

    if (method.startsWith('welcome')) {
      await WelcomeResponse.modalResponse(client, interaction, parts)
    }

    else if (method.startsWith('moderation')) {
      await ModerationResponse.modalResponse(client, interaction, parts)
    }
  }

  public static async select(client: NoirClient, interaction: AnySelectMenuInteraction<'cached'>) {
    const parts = interaction.customId.split('-')
    const method = parts[2]

    if (method.startsWith('welcome')) {
      await WelcomeResponse.selectResponse(client, interaction, parts)
    }

    else if (method.startsWith('moderation')) {
      await ModerationResponse.selectResponse(client, interaction, parts)
    }
  }
}