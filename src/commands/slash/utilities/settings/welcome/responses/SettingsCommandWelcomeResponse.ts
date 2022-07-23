import { ButtonInteraction, ModalMessageModalSubmitInteraction } from 'discord.js'
import NoirClient from '../../../../../../structures/Client'
import SettingsCommandWelcome from '../SettingsCommandWelcome'
import SettingsCommandWelcomeChannel from '../SettingsCommandWelcomeChannel'
import SettingsCommandWelcomeEditorResponses from './SettingsCommandWelcomeEditorResponses'

export default class SettingsCommandWelcomeResponses {
  public static async button(client: NoirClient, interaction: ButtonInteraction, parts: string[], method: string, id: string): Promise<void> {
    if (method == 'welcome') {
      await SettingsCommandWelcome.initialMessage(client, interaction, id)
    }

    else if (method == 'welcomeBack') {
      await SettingsCommandWelcome.initialMessage(client, interaction, id)
    }

    else if (method == 'welcomeSave') {
      await client.welcomeSettings.get(id)?.cacheData(client)
      await SettingsCommandWelcome.initialMessage(client, interaction, id)
    }

    else if (method == 'welcomeReset') {
      await client.welcomeSettings.get(id)?.requestData(client)
      await SettingsCommandWelcome.initialMessage(client, interaction, id)
    }

    else if (method == 'welcomeStatus') {
      const welcomeData = client.welcomeSettings.get(id)?.data

      if (!welcomeData) return

      welcomeData.status = !welcomeData.status
      await SettingsCommandWelcome.initialMessage(client, interaction, id)
    }

    else if (method == 'welcomeChannel') {
      await SettingsCommandWelcomeChannel.request(client, interaction, id)
    }

    else if (method.startsWith('welcomeEditor')) {
      await SettingsCommandWelcomeEditorResponses.button(client, interaction, parts, method, id)
    }
  }

  public static async modal(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, parts: string[], method: string, id: string): Promise<void> {
    if (method == 'welcomeChannel') SettingsCommandWelcomeChannel.response(client, interaction, id)
  }
}