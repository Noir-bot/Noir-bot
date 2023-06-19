import InfractionsCommand from '@commands/slash/moderation/infractions/Infractions'
import WarnConfirmation from '@commands/slash/moderation/warn/Confirmation'
import RolesCommand from '@commands/slash/private/info/Roles'
import HelpCommand from '@commands/slash/utilities/help/Help'
import SettingsResponses from '@commands/slash/utilities/settings/SettingsResponses'
import Client from '@structures/Client'
import { ButtonInteraction } from 'discord.js'

export default class ButtonExecution {
  public static async button(client: Client, interaction: ButtonInteraction) {
    const parts = interaction.customId.split('-')
    const name = parts[0].toLowerCase()

    if (name == 'settings' && interaction.inCachedGuild()) await SettingsResponses.button(client, interaction)
    else if (name == 'warn') WarnConfirmation.handleButton(client, interaction)
    else if ((name == 'rolesadd' || name == 'rolesremove') && interaction.inCachedGuild()) await RolesCommand.button(client, interaction, name)
    else if (name == 'infractions' && interaction.inCachedGuild()) InfractionsCommand.button(client, interaction)
    else if (name == 'help' && interaction.inCachedGuild()) HelpCommand.button(client, interaction)
  }
}