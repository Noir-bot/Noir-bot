import { AnySelectMenuInteraction, ButtonInteraction, ModalMessageModalSubmitInteraction } from 'discord.js'
import NoirClient from '../../../../../structures/Client'
import Save from '../../../../../structures/Save'
import Welcome from '../../../../../structures/Welcome'
import WelcomeMessage, { WelcomeMessageType } from '../../../../../structures/WelcomeMessage'
import SettingsCommand from '../SettingsCommand'
import WelcomeRole from './WelcomeRole'
import WelcomeSettings from './WelcomeSettings'
import WelcomeWebhook from './WelcomeWebhook'
import WelcomeEditor from './editor/WelcomeEditor'


export default class WelcomeResponse {
  public static async buttonResponse(client: NoirClient, interaction: ButtonInteraction<'cached'>, parts: string[]) {
    const id = parts[1]
    const method = parts[2]
    const methods = method.split('.')

    const saves = Save.cache(client, `${interaction.guildId}-welcome`)

    if (method == 'welcome') {
      await WelcomeSettings.initialMessage(client, interaction, id)
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
        const messageType = methods[3] as WelcomeMessageType
        await WelcomeEditor.exampleResponse(client, interaction, id, messageType)
      }

      else if (type == 'welcomeWebhook') {
        await WelcomeWebhook.initialMessage(client, interaction, id)
      }

      else {
        await WelcomeSettings.initialMessage(client, interaction, id)
      }
    }

    else if (method.startsWith('welcomeSave')) {
      await Welcome.save(client, interaction.guildId)
      saves.count = 0

      const type = methods[1]

      if (type == 'welcomeEditor') {
        const messageType = methods[2] as WelcomeMessageType

        await WelcomeMessage.save(client, interaction.guildId, messageType)
        await WelcomeEditor.initialMessage(client, interaction, id, messageType)
      }

      else if (type == 'welcomeRoles') {
        await WelcomeRole.initialMessage(client, interaction, id)
      }

      else if (type == 'welcomeWebhook') {
        await WelcomeWebhook.initialMessage(client, interaction, id)
      }

      else if (type == 'welcomeWebhookChannel') {
        await WelcomeWebhook.channelRequest(client, interaction, id)
      }

      else {
        await WelcomeSettings.initialMessage(client, interaction, id)
      }
    }

    else if (method.startsWith('welcomeRestore')) {
      await Welcome.cache(client, interaction.guildId, true)
      saves.count = 0

      const type = methods[1]

      if (type == 'welcomeEditor') {
        const messageType = methods[2] as WelcomeMessageType

        await WelcomeMessage.cache(client, interaction.guildId, messageType, true)
        await WelcomeEditor.initialMessage(client, interaction, id, messageType)
      }

      else if (type == 'welcomeRoles') {
        await WelcomeRole.initialMessage(client, interaction, id)
      }

      else if (type == 'welcomeWebhook') {
        await WelcomeWebhook.initialMessage(client, interaction, id)
      }

      else if (type == 'welcomeWebhookChannel') {
        await WelcomeWebhook.channelRequest(client, interaction, id)
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
      const welcomeData = await Welcome.cache(client, interaction.guildId)
      welcomeData.status = !welcomeData.status
      saves.count += 1
      await WelcomeSettings.initialMessage(client, interaction, id)
    }

    else if (method == 'welcomeRolesRestore') {
      const welcomeData = await Welcome.cache(client, interaction.guildId)
      welcomeData.restore = !welcomeData.restore
      saves.count += 1
      await WelcomeSettings.initialMessage(client, interaction, id)
    }

    else if (method == 'welcomeRoles') {
      await WelcomeRole.initialMessage(client, interaction, id)
    }

    else if (method == 'welcomeRolesClear') {
      await WelcomeRole.clearResponse(client, interaction, id)
    }

    else if (method.startsWith('welcomeEditor')) {
      await WelcomeEditor.buttonResponse(client, interaction, id, method)
    }

    else if (method.startsWith('welcomeWebhook')) {
      WelcomeWebhook.buttonResponse(client, interaction, id, method)
    }
  }

  public static async modalResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction<'cached'>, parts: string[]) {
    const id = parts[1]
    const method = parts[2]

    if (method.startsWith('welcomeEditor')) {
      await WelcomeEditor.modalResponse(client, interaction, id, method)
    }

    else if (method.startsWith('welcomeWebhook')) {
      await WelcomeWebhook.modalResponse(client, interaction, id, method)
    }
  }

  public static async selectResponse(client: NoirClient, interaction: AnySelectMenuInteraction<'cached'>, parts: string[]) {
    const id = parts[1]
    const method = parts[2]

    if (method.startsWith('welcomeEditor') && interaction.isStringSelectMenu()) {
      await WelcomeEditor.selectResponse(client, interaction, id, method)
    }

    else if (method.startsWith('welcomeRoles') && interaction.isRoleSelectMenu()) {
      await WelcomeRole.selectResponse(client, interaction, id, method)
    }

    else if (method.startsWith('welcomeWebhook')) {
      await WelcomeWebhook.selectResponse(client, interaction, id, method)
    }
  }
}