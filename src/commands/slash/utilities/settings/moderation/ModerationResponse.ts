import { ButtonInteraction, ModalMessageModalSubmitInteraction, SelectMenuInteraction } from 'discord.js'
import NoirClient from '../../../../../structures/Client'
import SettingsCommand from '../SettingsCommand'
import LoggingsSettings from './LoggingsSettings'
import ModerationSettings from './ModerationSettings'
import RuleSettings from './RuleSettings'


export default class ModerationResponse {
  public static async buttonResponse(client: NoirClient, interaction: ButtonInteraction, parts: string[]) {
    const id = parts[1]
    const method = parts[2]
    const methodSplit = method.split('.')

    if (method == 'moderation') {
      await ModerationSettings.initialMessage(client, interaction, id)
    }

    let moderationData = client.moderationSettings.get(id)?.data
    if (!moderationData) moderationData = await ModerationSettings.generateCache(client, id)
    if (!moderationData) return

    if (method.startsWith('moderationBack')) {
      const type = methodSplit[1]

      if (type == 'settings') {
        await SettingsCommand.initialMessage(client, interaction, id)
      }

      else if (type == 'rules') {
        await ModerationSettings.initialMessage(client, interaction, id)
      }

      else {
        await ModerationSettings.initialMessage(client, interaction, id)
      }
    }

    else if (method.startsWith('moderationSave')) {
      await client.moderationSettings.get(id)?.saveData(client)
      const type = methodSplit[1]

      if (type == 'loggings') {
        await LoggingsSettings.initialMessage(client, interaction, id)
      }

      else if (type == 'rules') {
        await RuleSettings.initialMessage(client, interaction, id)
      }

      else {
        await ModerationSettings.initialMessage(client, interaction, id)
      }
    }

    else if (method.startsWith('moderationRestore')) {
      await client.welcomeSettings.get(id)?.cacheData(client)
      const type = methodSplit[1]

      if (type == 'loggings') {
        await LoggingsSettings.initialMessage(client, interaction, id)
      }

      else if (type == 'rules') {
        await RuleSettings.initialMessage(client, interaction, id)
      }

      else {
        await ModerationSettings.initialMessage(client, interaction, id)
      }
    }

    else if (method == 'moderationCases') {
      moderationData.collectCases = !moderationData.collectCases
      await ModerationSettings.initialMessage(client, interaction, id)
    }

    else if (method == 'moderationLogs') {
      await LoggingsSettings.initialMessage(client, interaction, id)
    }

    else if (method == 'moderationLogsStatus') {
      moderationData.logs.status = !moderationData.logs.status
      await LoggingsSettings.initialMessage(client, interaction, id)
    }

    else if (method == 'moderationLogsChannel') {
      await LoggingsSettings.channelRequest(client, interaction, id)
    }

    else if (method == 'moderationLogsWebhook') {
      await LoggingsSettings.editRequest(client, interaction, id)
    }

    else if (method == 'moderationRules') {
      await RuleSettings.initialMessage(client, interaction, id)
    }

    else if (method == 'moderationRulesStatus') {
      moderationData.rules.status = !moderationData.rules.status

      await RuleSettings.initialMessage(client, interaction, id)
    }

    else if (method == 'moderationRulesAdd') {
      await RuleSettings.addRequest(client, interaction, id)
    }
  }

  public static async modalResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, parts: string[]) {
    const id = parts[1]
    const method = parts[2]

    let moderationData = client.moderationSettings.get(id)?.data
    if (!moderationData) moderationData = await ModerationSettings.generateCache(client, id)
    if (!moderationData) return

    else if (method == 'moderationLogsChannel') {
      await LoggingsSettings.channelResponse(client, interaction, id)
    }

    else if (method == 'moderationLogsWebhook') {
      await LoggingsSettings.editResponse(client, interaction, id)
    }

    else if (method == 'moderationRulesAdd') {
      await RuleSettings.addResponse(client, interaction, id)
    }

    else if (method.startsWith('moderationRulesEdit')) {
      const ruleId = method.split('.')[1]

      await RuleSettings.editResponse(client, interaction, id, parseInt(ruleId))
    }
  }

  public static async selectResponse(client: NoirClient, interaction: SelectMenuInteraction, parts: string[]) {
    const id = parts[1]
    const method = parts[2]

    let moderationData = client.moderationSettings.get(id)?.data
    if (!moderationData) moderationData = await ModerationSettings.generateCache(client, id)
    if (!moderationData) return

    if (method == 'moderationRules') {
      await RuleSettings.editRequest(client, interaction, id)
    }
  }
}