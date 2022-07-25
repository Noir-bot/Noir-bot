import { ButtonInteraction } from 'discord.js'
import NoirClient from '../../../../../../structures/Client'
import SettingsCommandWelcomeAuthor from '../components/SettingsCommandWelcomeAuthor'
import SettingsCommandWelcome from '../SettingsCommandWelcome'
import SettingsCommandWelcomeEditor from '../SettingsCommandWelcomeEditor'

export default class SettingsCommandWelcomeEditorResponses {
  public static async button(client: NoirClient, interaction: ButtonInteraction, parts: string[], method: string, id: string): Promise<void> {
    if (method == 'welcomeEditor') {
      await SettingsCommandWelcomeEditor.initialMessage(client, interaction, id)
    }

    else if (method == 'welcomeEditorBack') {
      await SettingsCommandWelcome.initialMessage(client, interaction, id)
    }

    else if (method == 'welcomeEditorSave') {
      await client.welcomeSettings.get(id)?.cacheData(client)
      await SettingsCommandWelcomeEditor.initialMessage(client, interaction, id)
    }

    else if (method == 'welcomeEditorReset') {
      await client.welcomeSettings.get(id)?.requestData(client)
      await SettingsCommandWelcomeEditor.initialMessage(client, interaction, id)
    }

    else if (method.startsWith('welcomeEditor*')) {
      const welcomeData = client.welcomeSettings.get(id)?.data.messages
      const type = method.split('*')[1]

      if (!welcomeData) return

      if (type == 'GuildStatus') welcomeData.guild.status = !welcomeData.guild.status
      else if (type == 'DirectStatus') welcomeData.direct.status = !welcomeData.direct.status

      await SettingsCommandWelcomeEditor.initialMessage(client, interaction, id)
    }

    else if (method.startsWith('welcomeEditor.')) {
      const type = method.split('.')[1]
      await SettingsCommandWelcomeEditor.editorMessage(client, interaction, id, type)
    }

    else if (method.startsWith('welcomeEditorSelectedBack')) {
      await SettingsCommandWelcomeEditor.initialMessage(client, interaction, id)
    }

    else if (method.startsWith('welcomeEditorSelectedSave.')) {
      const type = method.split('.')[1]
      await client.welcomeSettings.get(id)?.cacheData(client)
      await SettingsCommandWelcomeEditor.editorMessage(client, interaction, id, type)
    }

    else if (method.startsWith('welcomeEditorSelectedReset.')) {
      const type = method.split('.')[1]
      await client.welcomeSettings.get(id)?.requestData(client)
      await SettingsCommandWelcomeEditor.editorMessage(client, interaction, id, type)
    }

    else if (method.startsWith('welcomeEditorSelectedExample.')) {
      const type = method.split('.')[1]
      await SettingsCommandWelcomeEditor.editorMessage(client, interaction, id, type)
    }

    else if (method.startsWith('welcomeEditorAuthor:')) {
      const type = method.split(':')[1]
      await SettingsCommandWelcomeAuthor.request(client, interaction, id, type)
    }
  }

  public static async modal(client: NoirClient, interaction: ButtonInteraction, parts: string[], method: string, id: string): Promise<void> {
    if (method.startsWith('author:')) {
      const type = method.split(':')[1]
      await SettingsCommandWelcomeAuthor.response(client, interaction, id, type)
    }
  }
}