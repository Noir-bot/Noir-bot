import SettingsCommand from '@commands/slash/utilities/settings/SettingsCommand'
import ModerationLogs from '@commands/slash/utilities/settings/moderation/ModerationLogs'
import RuleSettings from '@commands/slash/utilities/settings/moderation/ModerationRules'
import ModerationSettings from '@commands/slash/utilities/settings/moderation/ModerationSettings'
import Client from '@structures/Client'
import Save from '@structures/Save'
import Moderation from '@structures/moderation/Moderation'
import ModerationRules from '@structures/moderation/ModerationRules'
import { AnySelectMenuInteraction, ButtonInteraction, ModalMessageModalSubmitInteraction } from 'discord.js'


export default class ModerationResponse {
  public static async buttonResponse(client: Client, interaction: ButtonInteraction<'cached'>, parts: string[]) {
    const id = parts[1]
    const method = parts[2]
    const methodSplit = method.split('.')
    const saves = Save.cache(client, `${interaction.guildId}-moderation`)

    const moderationData = await Moderation.cache(client, interaction.guildId, false, true)

    if (method == 'moderation') {
      await ModerationSettings.initialMessage(client, interaction, id)
    }

    if (method.startsWith('moderationBack')) {
      const type = methodSplit[1]

      if (type == 'settings') {
        await SettingsCommand.initialMessage(client, interaction, id)
      }

      else if (type == 'moderationRules') {
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
      saves.count = 0

      if (type == 'moderationLogs') {
        await ModerationLogs.initialMessage(client, interaction, id)
      }

      else if (type == 'moderationWebhookChannel') {
        await ModerationLogs.channelRequest(client, interaction, id)
      }

      else if (type == 'moderationRules') {
        await ModerationRules.save(client, interaction.guildId)
        await ModerationRules.cache(client, interaction.guildId, true, true)
        await RuleSettings.initialMessage(client, interaction, id)
      }

      else {
        await ModerationSettings.initialMessage(client, interaction, id)
      }
    }

    else if (method.startsWith('moderationRestore')) {
      await Moderation.cache(client, interaction.guildId, true, true)
      const type = methodSplit[1]
      saves.count = 0

      if (type == 'moderationLogs') {
        await ModerationLogs.initialMessage(client, interaction, id)
      }

      else if (type == 'moderationWebhookChannel') {
        await ModerationLogs.channelRequest(client, interaction, id)
      }

      else if (type == 'moderationRules') {
        await ModerationRules.cache(client, interaction.guildId, true, true)

        await RuleSettings.initialMessage(client, interaction, id)
      }

      else {
        await ModerationSettings.initialMessage(client, interaction, id)
      }
    }

    else if (method == 'moderationStatus') {
      moderationData.status = !moderationData.status
      saves.count += 1

      await ModerationSettings.initialMessage(client, interaction, id)
    }

    else if (method == 'moderationLogsStatus') {
      moderationData.logs = !moderationData.logs
      saves.count += 1

      await ModerationLogs.initialMessage(client, interaction, id)
    }

    else if (method == 'moderationRulesStatus') {
      moderationData.rules = !moderationData.rules
      saves.count += 1

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

  public static async modalResponse(client: Client, interaction: ModalMessageModalSubmitInteraction<'cached'>, parts: string[]) {
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

  public static async selectResponse(client: Client, interaction: AnySelectMenuInteraction<'cached'>, parts: string[]) {
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