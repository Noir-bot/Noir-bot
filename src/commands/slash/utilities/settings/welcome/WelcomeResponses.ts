import SettingsCommand from '@commands/slash/utilities/settings/SettingsCommand'
import WelcomeRole from '@commands/slash/utilities/settings/welcome/WelcomeRole'
import WelcomeSettings from '@commands/slash/utilities/settings/welcome/WelcomeSettings'
import WelcomeWebhook from '@commands/slash/utilities/settings/welcome/WelcomeWebhook'
import WelcomeEditor from '@commands/slash/utilities/settings/welcome/editor/WelcomeEditor'
import Client from '@structures/Client'
import Save from '@structures/Save'
import Welcome from '@structures/welcome/Welcome'
import WelcomeMessage, { WelcomeMessageType } from '@structures/welcome/WelcomeMessage'
import { AnySelectMenuInteraction, ButtonInteraction, ModalMessageModalSubmitInteraction } from 'discord.js'
import RateLimit from '../../../../../helpers/RateLimit'

export default class WelcomeResponse {
  public static async buttonResponse(client: Client, interaction: ButtonInteraction<'cached'>, parts: string[]) {
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
        const reg = /guild_join|guild_left|direct_join/g

        if (!reg.test(messageType)) return

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
      const type = methods[1]

      const rateLimited = RateLimit.limit(client, `${interaction.guildId}-welcomeSave`, 15)

      if (rateLimited) {
        RateLimit.message({
          client,
          interaction,
          id: `${interaction.guildId}-welcomeSave`
        })

        return
      }

      else {
        await Welcome.save(client, interaction.guildId)
        saves.count = 0

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
    }

    else if (method.startsWith('welcomeRestore')) {
      const type = methods[1]

      const rateLimited = RateLimit.limit(client, `${interaction.guildId}-welcomeRestore`, 15)

      if (rateLimited) {
        RateLimit.message({
          client,
          interaction,
          id: `${interaction.guildId}-welcomeRestore`
        })

        return
      }

      else {
        await Welcome.cache(client, interaction.guildId, true, true)
        saves.count = 0

        if (type == 'welcomeEditor') {
          const messageType = methods[2] as WelcomeMessageType

          await WelcomeMessage.cache(client, interaction.guildId, messageType, true, true)
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
      const welcomeData = await Welcome.cache(client, interaction.guildId, false, true)
      welcomeData.status = !welcomeData.status
      saves.count += 1
      await WelcomeSettings.initialMessage(client, interaction, id)
    }

    else if (method == 'welcomeRolesRestore') {
      const rateLimited = RateLimit.limit(client, `${interaction.guildId}-welcomeRolesRestore`, 15)

      if (rateLimited) {
        RateLimit.message({
          client,
          interaction,
          id: `${interaction.guildId}-welcomeRolesRestore`
        })

        return
      }

      const welcomeData = await Welcome.cache(client, interaction.guildId, false, true)
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

  public static async modalResponse(client: Client, interaction: ModalMessageModalSubmitInteraction<'cached'>, parts: string[]) {
    const id = parts[1]
    const method = parts[2]

    if (method.startsWith('welcomeEditor')) {
      await WelcomeEditor.modalResponse(client, interaction, id, method)
    }

    else if (method.startsWith('welcomeWebhook')) {
      await WelcomeWebhook.modalResponse(client, interaction, id, method)
    }
  }

  public static async selectResponse(client: Client, interaction: AnySelectMenuInteraction<'cached'>, parts: string[]) {
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