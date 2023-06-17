import InfractionsCommand from '@commands/slash/moderation/infractions/Infractions'
import RolesCommand from '@commands/slash/private/info/Roles'
import RulesCommand from '@commands/slash/private/info/Rules'
import HelpCommand from '@commands/slash/utilities/information/Help'
import SettingsResponses from '@commands/slash/utilities/settings/SettingsResponses'
import Client from '@structures/Client'
import { AnySelectMenuInteraction } from 'discord.js'

export default class SelectMenuExecution {
  public static async selectMenu(client: Client, interaction: AnySelectMenuInteraction) {
    const parts = interaction.customId.split('-')
    const name = parts[0].toLowerCase()

    if (name == 'settings' && interaction.inCachedGuild()) await SettingsResponses.select(client, interaction)
    else if (name == 'roles' && interaction.inCachedGuild() && interaction.isStringSelectMenu()) await RolesCommand.select(client, interaction)
    else if (name == 'rules' && interaction.inCachedGuild() && interaction.isStringSelectMenu()) RulesCommand.select(client, interaction)
    else if (name == 'infractions' && interaction.inCachedGuild() && interaction.isStringSelectMenu()) InfractionsCommand.select(client, interaction)
    else if (name == 'help' && interaction.inCachedGuild() && interaction.isStringSelectMenu()) HelpCommand.select(client, interaction)
  }
}