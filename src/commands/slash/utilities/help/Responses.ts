import Reply from '@helpers/Reply'
import Client from '@structures/Client'
import Moderation from '@structures/moderation/Moderation'
import { AnySelectMenuInteraction, ButtonInteraction } from 'discord.js'
import HelpCommand from './Help'
import HelpWizardFinish from './wizard/Finish'
import HelpWizardModeration from './wizard/Moderation'
import HelpWizardStart from './wizard/Start'
import HelpWizardWelcome from './wizard/Welcome'

export default class HelpResponses {
  public static async button(client: Client, interaction: ButtonInteraction<'cached'>) {
    const id = interaction.customId

    if (id == 'help-setup-start') {
      await HelpWizardWelcome.initialMessage(client, interaction)
    }

    else if (id == 'help-setup-cancel') {
      await HelpCommand.initialMessage(client, interaction)
    }

    else if (id.startsWith('help-setup')) {
      const userId = id.split('-')[2]

      if (interaction.user.id != userId) {
        await Reply.reply({
          client,
          interaction,
          description: '# Permission error\nThis feature is available for the command author.'
        })

        return
      }

      if (!interaction.memberPermissions.has('Administrator') || !interaction.memberPermissions.has('ManageGuild')) {
        await Reply.reply({
          client,
          interaction,
          description: '# Permission error\nNot enough permission to change server settings.'
        })

        return
      }

      await HelpWizardStart.initialMessage(client, interaction)
    }

    else if (id == 'help-welcome-back') {
      await HelpWizardStart.initialMessage(client, interaction)
    }

    else if (id == 'help-moderation-back') {
      await HelpWizardWelcome.initialMessage(client, interaction)
    }

    else if (id == 'help-welcome-next') {
      await HelpWizardModeration.initialMessage(client, interaction)
    }

    else if (id == 'help-moderation-next') {
      await HelpWizardFinish.initialMessage(client, interaction)
    }

    else if (id == 'help-finish-back') {
      await HelpWizardModeration.initialMessage(client, interaction)
    }

    else if (id == 'help-finish-save') {
      await HelpWizardFinish.saveResponse(client, interaction)
    }

    else if (id == 'help-moderation-logs') {
      const moderationData = await Moderation.cache(client, interaction.guildId, false, true)

      moderationData.logs = !moderationData.logs

      await HelpWizardModeration.initialMessage(client, interaction)
    }
  }

  public static async select(client: Client, interaction: AnySelectMenuInteraction<'cached'>) {
    const id = interaction.customId

    if (id == 'help-welcome-role' && interaction.isRoleSelectMenu()) {
      await HelpWizardWelcome.rolesResponse(client, interaction)
    }

    else if (id == 'help-welcome-channel' && interaction.isChannelSelectMenu()) {
      await HelpWizardWelcome.channelResponse(client, interaction)
    }

    else if (id == 'help-moderation-channel' && interaction.isChannelSelectMenu()) {
      await HelpWizardModeration.channelResponse(client, interaction)
    }
  }
}