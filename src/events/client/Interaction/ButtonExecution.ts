import WarnConfirmation from '@commands/slash/moderation/warn/Confirmation'
import HelpCommandResponses from '@commands/slash/utilities/help/HelpCommandResponses'
import SettingsResponses from '@commands/slash/utilities/settings/SettingsResponses'
import Client from '@structures/Client'
import { ButtonInteraction } from 'discord.js'

export default class ButtonExecution {
  public static async button(client: Client, interaction: ButtonInteraction) {
    const parts = interaction.customId.split('-')
    const name = parts[0].toLowerCase()

    if (name == 'help') await HelpCommandResponses.button(client, interaction)
    else if (name == 'settings' && interaction.inCachedGuild()) await SettingsResponses.button(client, interaction)
    else if (name == 'warn') WarnConfirmation.handleButton(client, interaction)
  }
}