import { ButtonInteraction, ModalMessageModalSubmitInteraction, SelectMenuInteraction } from 'discord.js'
import { WelcomeMessageType } from '../../../../../constants/Options'
import NoirClient from '../../../../../structures/Client'
import SettingsCommand from '../SettingsCommand'
import WelcomeEditor from './editor/WelcomeEditor'
import WelcomeRole from './WelcomeRole'
import WelcomeSettings from './WelcomeSettings'
import WelcomeWebhook from './WelcomeWebhook'


export default class WelcomeResponse {
  public static async buttonResponse(client: NoirClient, interaction: ButtonInteraction, parts: string[]) {
    const id = parts[1]
    const method = parts[2]
    const methods = method.split('.')

    if (method == 'welcome') {
      await WelcomeSettings.initialMessage(client, interaction, id)
    }

    let welcomeData = client.welcomeSettings.get(id)?.data

    if (!welcomeData) {
      welcomeData = await WelcomeSettings.generateCache(client, id)
    }

    if (method.startsWith('welcomeBack')) {
      const type = methods[1]

      if (type == 'settings') {
        await SettingsCommand.initialMessage(client, interaction, id)
      }

      else if (type == 'welcomeEditor') {
        const messageType = methods[2] as WelcomeMessageType
        await WelcomeEditor.initialMessage(client, interaction, id, messageType)
      }

      else if (type == 'welcomeRoleEdit') {
        await WelcomeRole.initialMessage(client, interaction, id)
      }

      else if (type == 'welcomeExample') {
        const messageType = methods[2] as WelcomeMessageType
        await WelcomeEditor.exampleResponse(client, interaction, id, messageType)
      }

      else {
        await WelcomeSettings.initialMessage(client, interaction, id)
      }
    }

    else if (method.startsWith('welcomeSave')) {
      await client.welcomeSettings.get(id)?.saveData(client)
      const type = methods[1]

      if (type == 'welcomeEditor') {
        const messageType = methods[2] as WelcomeMessageType
        await WelcomeEditor.initialMessage(client, interaction, id, messageType)
      }

      else if (type == 'welcomeRoleEdit') {
        await WelcomeRole.editRequest(client, interaction, id)
      }

      else if (type == 'welcomeRoles') {
        await WelcomeRole.initialMessage(client, interaction, id)
      }

      else if (type == 'welcomeWebhook') {
        await WelcomeWebhook.initialMessage(client, interaction, id)
      }

      else {
        await WelcomeSettings.initialMessage(client, interaction, id)
      }
    }

    else if (method.startsWith('welcomeRestore')) {
      await client.welcomeSettings.get(id)?.cacheData(client)
      const type = methods[1]

      if (type == 'welcomeEditor') {
        const messageType = methods[2] as WelcomeMessageType
        await WelcomeEditor.initialMessage(client, interaction, id, messageType)
      }

      else if (type == 'welcomeRoleEdit') {
        await WelcomeRole.editRequest(client, interaction, id)
      }

      else if (type == 'welcomeRoles') {
        await WelcomeRole.initialMessage(client, interaction, id)
      }

      else if (type == 'welcomeWebhook') {
        await WelcomeWebhook.initialMessage(client, interaction, id)
      }

      else {
        await WelcomeSettings.initialMessage(client, interaction, id)
      }
    }

    else if (method.startsWith('welcomeExample')) {
      const messageType = methods[2] as WelcomeMessageType
      await WelcomeEditor.exampleResponse(client, interaction, id, messageType)
    }

    else if (method.startsWith('welcomeReset')) {
      const messageType = methods[2] as WelcomeMessageType
      const type = methods[3]

      if (!type) {
        await WelcomeEditor.resetRequest(client, interaction, id, messageType)
      }

      else if (type == 'confirm') {
        await WelcomeEditor.resetResponse(client, interaction, id, messageType)
      }

      else {
        await WelcomeEditor.initialMessage(client, interaction, id, messageType)
      }
    }

    else if (method == 'welcomeStatus') {
      if (!welcomeData) return
      welcomeData.status = !welcomeData.status
      await WelcomeSettings.initialMessage(client, interaction, id)
    }

    else if (method == 'welcomeRolesRestore') {
      if (!welcomeData) return
      welcomeData.restoreRoles = !welcomeData.restoreRoles
      await WelcomeSettings.initialMessage(client, interaction, id)
    }

    else if (method.startsWith('welcomeEditor')) {
      await WelcomeEditor.buttonResponse(client, interaction, id, method)
    }

    else if (method.startsWith('welcomeRoles')) {
      await WelcomeRole.buttonResponse(client, interaction, id, method)
    }

    else if (method.startsWith('welcomeWebhook')) {
      WelcomeWebhook.buttonResponse(client, interaction, id, method)
    }
  }

  public static async modalResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, parts: string[]) {
    const id = parts[1]
    const method = parts[2]

    let welcomeData = client.welcomeSettings.get(id)?.data
    if (!welcomeData) welcomeData = await WelcomeSettings.generateCache(client, id)
    if (!welcomeData) return

    if (method.startsWith('welcomeEditor')) {
      await WelcomeEditor.modalResponse(client, interaction, id, method)
    }

    else if (method.startsWith('welcomeRoles')) {
      await WelcomeRole.modalResponse(client, interaction, id, method)
    }

    else if (method.startsWith('welcomeWebhook')) {
      await WelcomeWebhook.modalResponse(client, interaction, id, method)
    }
  }

  public static async selectResponse(client: NoirClient, interaction: SelectMenuInteraction, parts: string[]) {
    const id = parts[1]
    const method = parts[2]

    let welcomeData = client.welcomeSettings.get(id)?.data
    if (!welcomeData) welcomeData = await WelcomeSettings.generateCache(client, id)
    if (!welcomeData) return

    if (method.startsWith('welcomeEditor')) {
      await WelcomeEditor.selectResponse(client, interaction, id, method)
    }

    if (method.startsWith('welcomeRoles')) {
      await WelcomeRole.selectResponse(client, interaction, id, method)
    }
  }
}