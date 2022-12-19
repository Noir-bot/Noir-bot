import { AnySelectMenuInteraction, ButtonInteraction, ModalMessageModalSubmitInteraction } from 'discord.js'
import NoirClient from '../../../../../structures/Client'
import Moderation from '../../../../../structures/Moderation'
import ModerationRules from '../../../../../structures/ModerationRules'
import SettingsCommand from '../SettingsCommand'
import ModerationLogs from './ModerationLogs'
import RuleSettings from './ModerationRules'
import ModerationSettings from './ModerationSettings'


export default class ModerationResponse {
  public static async buttonResponse(client: NoirClient, interaction: ButtonInteraction<'cached'>, parts: string[]) {
    const id = parts[1]
    const method = parts[2]
    const methodSplit = method.split('.')

    const moderationData = await Moderation.cache(client, interaction.guildId)

    if (method == 'moderation') {
      await ModerationSettings.initialMessage(client, interaction, id)
    }

    if (method.startsWith('moderationBack')) {
      const type = methodSplit[1]

      if (type == 'settings') {
        await SettingsCommand.initialMessage(client, interaction, id)
      }

      else if (type == 'rules') {
        await ModerationSettings.initialMessage(client, interaction, id)
      }

      else if (type == 'moderationWebhookChannel') {
        await ModerationLogs.initialMessage(client, interaction, id)
      }

      else {
        await ModerationSettings.initialMessage(client, interaction, id)
      }
    }

    else if (method.startsWith('moderationSave')) {
      await Moderation.save(client, interaction.guildId)
      const type = methodSplit[1]

      if (type == 'moderationLogs') {
        await ModerationLogs.initialMessage(client, interaction, id)
      }

      else if (type == 'moderationWebhookChannel') {
        await ModerationLogs.channelRequest(client, interaction, id)
      }

      else if (type == 'rules') {
        await RuleSettings.initialMessage(client, interaction, id)
      }

      else {
        await ModerationSettings.initialMessage(client, interaction, id)
      }
    }

    else if (method.startsWith('moderationRestore')) {
      await Moderation.cache(client, interaction.guildId, true)
      const type = methodSplit[1]

      if (type == 'moderationLogs') {
        await ModerationLogs.initialMessage(client, interaction, id)
      }

      else if (type == 'moderationWebhookChannel') {
        await ModerationLogs.channelRequest(client, interaction, id)
      }

      else if (type == 'rules') {
        await ModerationRules.cache(client, interaction.guildId, true)

        await RuleSettings.initialMessage(client, interaction, id)
      }

      else {
        await ModerationSettings.initialMessage(client, interaction, id)
      }
    }

    else if (method == 'moderationStatus') {
      moderationData.status = !moderationData.status

      await ModerationSettings.initialMessage(client, interaction, id)
    }

    else if (method == 'moderationLogsStatus') {
      moderationData.modLogs = !moderationData.modLogs

      await ModerationLogs.initialMessage(client, interaction, id)
    }

    else if (method == 'moderationRulesStatus') {
      moderationData.rulesLogs = !moderationData.rulesLogs

      await RuleSettings.initialMessage(client, interaction, id)
    }

    else if (method == 'moderationLogs') {
      await ModerationLogs.initialMessage(client, interaction, id)
    }

    else if (method == 'moderationRules') {
      await RuleSettings.initialMessage(client, interaction, id)
    }

    else if (method == 'moderationRulesAdd') {
      await RuleSettings.addRequest(client, interaction, id)
    }

    else if (method.startsWith('moderationWebhook')) {
      ModerationLogs.buttonResponse(client, interaction, id, method)
    }
  }

  public static async modalResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction<'cached'>, parts: string[]) {
    const id = parts[1]
    const method = parts[2]

    if (method.startsWith('moderationWebhook')) {
      await ModerationLogs.modalResponse(client, interaction, id, method)
    }

    else if (method == 'moderationRulesAdd') {
      await RuleSettings.addResponse(client, interaction, id)
    }

    else if (method.startsWith('moderationRulesEdit')) {
      const ruleId = method.split('.')[1]

      await RuleSettings.editResponse(client, interaction, id, ruleId)
    }
  }

  public static async selectResponse(client: NoirClient, interaction: AnySelectMenuInteraction<'cached'>, parts: string[]) {
    const id = parts[1]
    const method = parts[2]

    if (method.startsWith('moderationWebhook')) {
      await ModerationLogs.selectResponse(client, interaction, id, method)
    }

    else if (method == 'moderationRules' && interaction.isStringSelectMenu()) {
      await RuleSettings.editRequest(client, interaction, id)
    }
  }
}