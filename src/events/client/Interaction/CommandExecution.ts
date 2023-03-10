import MaintenanceCommand from '@commands/slash/private/Maintenance'
import Colors from '@constants/Colors'
import Options from '@constants/Options'
import Reply from '@helpers/Reply'
import Utils from '@helpers/Utils'
import Client from '@structures/Client'
import Command from '@structures/commands/Command'
import chalk from 'chalk'
import { CommandInteraction, ContextMenuCommandInteraction } from 'discord.js'

export default class CommandExecution {
  public static async command(client: Client, interaction: CommandInteraction | ContextMenuCommandInteraction): Promise<void> {
    const command = client.commands.get(interaction.commandName) as Command

    try {
      if (Options.maintenance && command.data.name != new MaintenanceCommand(client).data.name) {
        await Reply.reply({
          client: client,
          interaction: interaction,
          color: Colors.warning,
          author: 'Maintenance mode',
          description: 'Noir is under maintenance mode'
        })

        return
      }

      if (!command.options.status) {
        await Reply.reply({
          client: client,
          interaction: interaction,
          color: Colors.warning,
          author: 'Command error',
          description: 'Command is currently unavailable'
        })

        return
      }

      if (command.options.permission && interaction.guild?.members?.me?.permission.has(command.options.permission) && !interaction.guild?.members?.me?.permission.has('Administrator')) {
        await Reply.reply({
          client: client,
          interaction: interaction,
          color: Colors.warning,
          author: 'permission error',
          description: 'Noir doesn\'t have enough permission'
        })

        return
      }

      if (command.options.access == 'private' && !Options.owners.includes(interaction.user.id)) {
        await Reply.reply({
          client: client,
          interaction: interaction,
          color: Colors.warning,
          author: 'Access denied',
          description: 'Command is private'
        })

        return
      }

      if (command.options.access == 'premium') {
        if (interaction.guild?.id) {
          const guildPremium = client.premium.get(interaction.guild.id)

          if (!guildPremium || !guildPremium.status) {
            await Reply.reply({
              client: client,
              interaction: interaction,
              color: Colors.warning,
              author: 'Premium error',
              description: 'Command is premium only'
            })

            return
          }
        }
      }

      command.execute(client, interaction)
    } catch (error: any) {
      await Reply.reply({
        client: client,
        interaction: interaction,
        color: Colors.warning,
        author: 'Execution error',
        description: `Unspecified error occurred. Please contact Noir support team, join [support server](${Options.guildInvite}) for more information`
      })

      throw new Error(chalk.bgRed.white(`${Utils.capitalize(command.data.name)} command error: \n`) + chalk.red(error.stack))
    }
  }
}