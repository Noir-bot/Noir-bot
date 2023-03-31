import MaintenanceCommand from '@commands/slash/private/tools/Maintenance'
import Colors from '@constants/Colors'
import Options from '@constants/Options'
import RateLimit from '@helpers/RateLimit'
import Reply from '@helpers/Reply'
import Utils from '@helpers/Utils'
import Client from '@structures/Client'
import Command, { AccessType } from '@structures/commands/Command'
import chalk from 'chalk'
import { CommandInteraction, ContextMenuCommandInteraction, PermissionResolvable } from 'discord.js'

export default class CommandExecution {
  public static async command(client: Client, interaction: CommandInteraction | ContextMenuCommandInteraction) {
    const command = client.commands.get(interaction.commandName) as Command

    try {
      if (command.options.rateLimit && command.options.rateLimit > 0) {
        const id = `${interaction.command?.id}-${interaction.user.id}`
        const rateLimit = RateLimit.limit(client, id, command.options.rateLimit)

        if (rateLimit) {
          await RateLimit.message({
            client,
            interaction,
            update: false,
            id,
          })

          return
        }
      }

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

      if (!interaction.guild?.members?.me?.permissions.has(command.options.permissions ?? 'Administrator')) {
        const fields = [
          {
            name: 'Required permission',
            value: `${command.options.permissions.toString().split(',').filter(perm => {
              return !interaction.guild?.members.me?.permissions.has(perm as PermissionResolvable)
            })}`,
            inline: false
          }
        ]

        await Reply.reply({
          client: client,
          interaction: interaction,
          color: Colors.warning,
          author: 'Permission error',
          description: 'Noir doesn\'t have enough permission',
          fields: fields ? fields : undefined
        })

        return
      }

      if (command.options.access === AccessType.Private && !Options.owners.includes(interaction.user.id)) {
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