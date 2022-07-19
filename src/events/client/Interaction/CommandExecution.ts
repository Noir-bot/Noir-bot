import chalk from 'chalk'
import { CommandInteraction, ContextMenuCommandInteraction } from 'discord.js'
import MaintenanceCommand from '../../../commands/slash/private/Maintenance'
import Colors from '../../../constants/Colors'
import Options from '../../../constants/Options'
import NoirClient from '../../../structures/Client'
import Command from '../../../structures/command/Command'

export default class CommandExecution {
  public static async command(client: NoirClient, interaction: CommandInteraction | ContextMenuCommandInteraction): Promise<void> {
    const command = client.commands.get(interaction.commandName) as Command

    try {
      if (Options.maintenance && command.data.name != new MaintenanceCommand(client).data.name) {
        await client.reply.reply({
          interaction: interaction,
          color: Colors.warning,
          author: 'Maintenance mode',
          description: 'Noir is under maintenance mode'
        })

        return
      }

      if (!command.options.status) {
        await client.reply.reply({
          interaction: interaction,
          color: Colors.warning,
          author: 'Command error',
          description: 'Command is currently unavailable'
        })

        return
      }

      if (command.options.permissions && interaction.guild?.members?.me?.permissions.has(command.options.permissions) && !interaction.guild?.members?.me?.permissions.has('Administrator')) {
        await client.reply.reply({
          interaction: interaction,
          color: Colors.warning,
          author: 'Permissions error',
          description: 'Noir doesn\'t have enough permissions'
        })

        return
      }

      if (command.options.access == 'private' && !Options.owners.includes(interaction.user.id)) {
        await client.reply.reply({
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

          if (!guildPremium || !guildPremium?.status) {
            await client.reply.reply({
              interaction: interaction,
              color: Colors.warning,
              author: 'Premium error',
              description: 'Command is premium only'
            })

            return
          }

          if (guildPremium.expired()) {
            await client.reply.reply({
              interaction: interaction,
              color: Colors.warning,
              author: 'Premium error',
              description: 'Premium has expired'
            })

            return
          }
        }
      }

      command.execute(client, interaction)
    } catch (error: any) {
      await client.reply.reply({
        interaction: interaction,
        color: Colors.warning,
        author: 'Execution error',
        description: `Unspecified error occurred. Please contact Noir support team, join [support server](${Options.guildInvite}) for more information`
      })

      throw new Error(chalk.bgRed.white(`${client.utils.capitalize(command.data.name)} command error: \n`) + chalk.red(error.stack))
    }
  }
}