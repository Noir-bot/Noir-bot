import chalk from 'chalk'
import { ButtonInteraction, CommandInteraction, Interaction, InteractionType, ModalMessageModalSubmitInteraction, ModalSubmitInteraction, SelectMenuInteraction } from 'discord.js'
import Premium from '../../collections/Premium'
import MaintenanceCommand from '../../commands/slash/private/Maintenance'
import HelpCommand from '../../commands/slash/utilities/Help'
import MessageCommand from '../../commands/slash/utilities/Message'
import Colors from '../../constants/Colors'
import Options from '../../constants/Options'
import NoirClient from '../../structures/Client'
import Command from '../../structures/command/Command'
import Event from '../../structures/Event'

export default class InteractionEvent extends Event {
  constructor(client: NoirClient) {
    super(client, 'interactionCreate', false)
  }

  public async execute(client: NoirClient, interaction: Interaction): Promise<void> {
    await this.premiumCache(client, interaction)

    if (interaction.type == InteractionType.ApplicationCommand && (interaction.isChatInputCommand() || interaction.isContextMenuCommand())) await this.command(client, interaction)
    else if (interaction.type == InteractionType.ModalSubmit) await this.messageModal(client, interaction as ModalMessageModalSubmitInteraction | ModalSubmitInteraction)
    else if (interaction.type == InteractionType.MessageComponent && interaction.isButton()) await this.button(client, interaction)
    else if (interaction.type == InteractionType.MessageComponent && interaction.isSelectMenu()) await this.selectMenu(client, interaction)
  }

  private async premiumCache(client: NoirClient, interaction: Interaction) {
    if (interaction.guild) {
      let guildPremium = client.premium.get(interaction.guild.id)

      if (!guildPremium) {
        let premium = await client.prisma.premium.findFirst({ where: { guild: interaction.guild.id } })

        if (!premium) {
          premium = await client.prisma.premium.create({
            data: {
              guild: interaction.guild.id,
              expireAt: new Date(),
              status: false
            }
          })
        }

        guildPremium = new Premium(premium?.expireAt ?? new Date(), premium?.status ?? false)
        client.premium.set(interaction.guild.id, guildPremium)
      }

      if (guildPremium.expired() && guildPremium.status == true) {
        await client.prisma.premium.updateMany({
          where: { guild: interaction.guild.id },
          data: { status: false }
        })

        guildPremium.status = false
      }
    }
  }

  private async command(client: NoirClient, interaction: CommandInteraction): Promise<void> {
    const command = client.commands.get(interaction.commandName) as Command

    try {

      if (Options.maintenance && command.data.name != new MaintenanceCommand(client).data.name) {
        await client.reply.reply({
          interaction: interaction,
          color: Colors.warning,
          author: 'Maintenance mode',
          description: 'Maintenance mode, try again later'
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
          description: 'I don\'t have enough permissions'
        })

        return
      }

      if (command.options.access == 'private' && !Options.owners.includes(interaction.user.id)) {
        await client.reply.reply({
          interaction: interaction,
          color: Colors.warning,
          author: 'Access denied',
          description: 'Command is restricted'
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
              description: 'Command premium only'
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
      client.reply.reply({
        interaction: interaction,
        color: Colors.warning,
        author: 'Execution error',
        description: `Unspecified error occurred, please contact us about it, join our [support server](${Options.guildInvite}) for more information`
      })

      throw new Error(chalk.bgRed.white(`${client.utils.capitalize(command.data.name)} command error: `) + '\n' + chalk.red(error.stack))
    }
  }

  private async button(client: NoirClient, interaction: ButtonInteraction): Promise<void> {
    const parts = interaction.customId.toLowerCase().split('-')

    if (parts[0] == 'message') await new MessageCommand(client).buttonResponse(client, interaction)
    else if (parts[0] == 'help') await new HelpCommand(client).buttonResponse(client, interaction)
  }

  private async messageModal(client: NoirClient, interaction: ModalSubmitInteraction | ModalMessageModalSubmitInteraction): Promise<void> {
    const parts = interaction.customId.toLowerCase().split('-')

    if (parts[0] == 'message') await new MessageCommand(client).modalResponse(client, interaction as ModalMessageModalSubmitInteraction)
    // else if (parts[0] == 'restriction') await new RestrictionCommand(client).modalResponse(client, interaction as ModalMessageModalSubmitInteraction)
  }

  private async selectMenu(client: NoirClient, interaction: SelectMenuInteraction): Promise<void> {
    const parts = interaction.customId.toLowerCase().split('-')

    if (parts[0] == 'message') await new MessageCommand(client).selectResponse(client, interaction)
  }
}