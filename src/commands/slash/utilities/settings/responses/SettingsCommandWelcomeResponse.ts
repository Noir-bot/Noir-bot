import { ButtonInteraction, ModalMessageModalSubmitInteraction, SelectMenuInteraction } from 'discord.js'
import NoirClient from '../../../../../structures/Client'
import SettingsCommand from '../SettingsCommand'
import SettingsCommandWelcome from '../welcome/SettingsCommandWelcome'
import SettingsCommandWelcomeChannel from '../welcome/SettingsCommandWelcomeChannel'
import SettingsCommandWelcomeRoles from '../welcome/SettingsCommandWelcomeRoles'


export default class SettingsCommandWelcomeResponses {
  public static async button(client: NoirClient, interaction: ButtonInteraction, parts: string[]): Promise<void> {
    const method = parts[2]
    const id = parts[1]

    if (method == 'welcome') {
      await SettingsCommandWelcome.initialMessage(client, interaction, id)
    }

    const welcomeData = client.welcomeSettings.get(id)?.data

    if (!welcomeData) return

    console.log(welcomeData.roles)

    if (method == 'welcomeBack') {
      await SettingsCommand.initialMessage(client, interaction, id)
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
      welcomeData.status = !welcomeData.status
      await SettingsCommandWelcome.initialMessage(client, interaction, id)
    }

    else if (method == 'welcomeChannel') {
      await SettingsCommandWelcomeChannel.request(client, interaction, id)
    }

    else if (method == 'welcomeRoles') {
      await SettingsCommandWelcomeRoles.initialMessage(client, interaction, id)
    }

    else if (method == 'welcomeRolesAdd') {
      await SettingsCommandWelcomeRoles.addRequest(client, interaction, id)
    }

    else if (method == 'welcomeRolesRemove') {
      await SettingsCommandWelcomeRoles.removeRequest(client, interaction, id)
    }
  }

  public static async modal(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, parts: string[]): Promise<void> {
    const method = parts[2]
    const id = parts[1]

    if (method == 'welcomeChannel') {
      await SettingsCommandWelcomeChannel.response(client, interaction, id)
    }

    else if (method == 'welcomeRolesAdd') {
      await SettingsCommandWelcomeRoles.addResponse(client, interaction, id)
    }
  }

  public static async selectMenu(client: NoirClient, interaction: SelectMenuInteraction, parts: string[]): Promise<void> {
    const method = parts[2]
    const id = parts[1]

    if (method == 'welcomeRolesRemove') {
      await SettingsCommandWelcomeRoles.removeResponse(client, interaction, id)
    }
  }
}