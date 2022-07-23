import { ButtonInteraction } from 'discord.js'
import EmbedCommandResponses from '../../../commands/slash/utilities/embed/EmbedCommandResponses'
import HelpCommandResponses from '../../../commands/slash/utilities/help/HelpCommandResponses'
import SettingsCommandResponses from '../../../commands/slash/utilities/settings/SettingsCommandResponses'
import NoirClient from '../../../structures/Client'

export default class ButtonExecution {
  public static async button(client: NoirClient, interaction: ButtonInteraction): Promise<void> {
    const parts = interaction.customId.split('-')
    const name = parts[0].toLowerCase()

    if (name == 'embed') await EmbedCommandResponses.button(client, interaction)
    else if (name == 'help') await HelpCommandResponses.button(client, interaction)
    else if (name == 'settings') await SettingsCommandResponses.button(client, interaction)
  }
}