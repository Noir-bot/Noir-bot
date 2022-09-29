import { ButtonInteraction } from 'discord.js'
import WarnConfirmation from '../../../commands/slash/moderation/warn/WarnConfirmation'
import HelpCommandResponses from '../../../commands/slash/utilities/help/HelpCommandResponses'
import SettingsResponses from '../../../commands/slash/utilities/settings/SettingsResponses'
import NoirClient from '../../../structures/Client'

export default class ButtonExecution {
  public static async button(client: NoirClient, interaction: ButtonInteraction): Promise<void> {
    const parts = interaction.customId.split('-')
    const name = parts[0].toLowerCase()

    if (name == 'help') await HelpCommandResponses.button(client, interaction)
    else if (name == 'settings') await SettingsResponses.buttonResponse(client, interaction)
    else if (name == 'warn') await WarnConfirmation.buttonResponse(client, interaction)
  }
}