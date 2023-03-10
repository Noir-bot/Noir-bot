import ModerationResponse from '@commands/slash/utilities/settings/moderation/ModerationResponse'
import WelcomeResponse from '@commands/slash/utilities/settings/welcome/WelcomeResponses'
import Client from '@structures/Client'
import { AnySelectMenuInteraction, ButtonInteraction, ModalMessageModalSubmitInteraction } from 'discord.js'

export default class SettingsResponses {
  public static async button(client: Client, interaction: ButtonInteraction<'cached'>) {
    const parts = interaction.customId.split('-')
    const method = parts[2]

    if (method.startsWith('welcome')) {
      await WelcomeResponse.buttonResponse(client, interaction, parts)
    }

    else if (method.startsWith('moderation')) {
      await ModerationResponse.buttonResponse(client, interaction, parts)
    }
  }

  public static async modal(client: Client, interaction: ModalMessageModalSubmitInteraction<'cached'>) {
    const parts = interaction.customId.split('-')
    const method = parts[2]

    if (method.startsWith('welcome')) {
      await WelcomeResponse.modalResponse(client, interaction, parts)
    }

    else if (method.startsWith('moderation')) {
      await ModerationResponse.modalResponse(client, interaction, parts)
    }
  }

  public static async select(client: Client, interaction: AnySelectMenuInteraction<'cached'>) {
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