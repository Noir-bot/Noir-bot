import chalk from 'chalk'
import { ButtonInteraction, CommandInteraction, Interaction, InteractionType, ModalMessageModalSubmitInteraction, ModalSubmitInteraction, SelectMenuInteraction } from 'discord.js'
import MessageCommand from '../../commands/slash/utils/Message'
import { colors } from '../../libs/config/design'
import { invite, owners } from '../../libs/config/settings'
import NoirClient from '../../libs/structures/Client'
import NoirCommand from '../../libs/structures/command/Command'
import NoirEvent from '../../libs/structures/event/Event'
import NoirPremium from '../../libs/structures/Premium'

export default class InteractionEvent extends NoirEvent {
  constructor(client: NoirClient) {
    super(client, 'interactionCreate', false)
  }

  public async execute(client: NoirClient, interaction: Interaction): Promise<void> {
    if (interaction.guild) {
      let guildPremium = client.noirPremiums.get(interaction.guild.id)

      if (!guildPremium) {
        let premium = await client.noirPrisma.premium.findFirst({ where: { guild: interaction.guild.id } })

        if (!premium) {
          premium = await client.noirPrisma.premium.create({
            data: {
              guild: interaction.guild.id,
              expireAt: new Date(),
              status: false
            }
          })
        }

        guildPremium = new NoirPremium(interaction.guild.id, premium?.expireAt ?? new Date(), premium?.status ?? false)
        client.noirPremiums.set(interaction.guild.id, guildPremium)
      }

      if (guildPremium.expired() && guildPremium.status == true) {
        await client.noirPrisma.premium.updateMany({
          where: { guild: interaction.guild.id },
          data: { status: false }
        })

        guildPremium.status = false
      }
    }

    if (interaction.type == InteractionType.ApplicationCommand) await this.command(client, interaction)
    else if (interaction.type == InteractionType.ModalSubmit) await this.messageModal(client, interaction as ModalMessageModalSubmitInteraction | ModalSubmitInteraction)
    else if (interaction.isButton()) await this.button(client, interaction)
    else if (interaction.isSelectMenu()) await this.selectMenu(client, interaction)
  }

  protected async command(client: NoirClient, interaction: CommandInteraction): Promise<void> {
    const command = client.noirCommands.get(interaction.commandName) as NoirCommand

    try {
      if (client.noirMaintenance && command.data.name != 'maintenance') {
        await client.noirReply.reply({
          interaction: interaction,
          color: colors.Warning,
          author: 'Maintenance mode',
          description: 'Maintenance mode, try again later'
        })

        return
      }

      if (!command.settings.status) {
        await client.noirReply.reply({
          interaction: interaction,
          color: colors.Warning,
          author: 'Command error',
          description: 'Command is currently unavailable'
        })

        return
      }

      if (command.settings.permissions && interaction.guild?.members?.me?.permissions.has(command.settings.permissions) && !interaction.guild?.members?.me?.permissions.has('Administrator')) {
        await client.noirReply.reply({
          interaction: interaction,
          color: colors.Warning,
          author: 'Permissions error',
          description: 'I don\'t have enough permissions'
        })

        return
      }

      if (command.settings.access == 'private' && !owners.includes(interaction.user.id)) {
        await client.noirReply.reply({
          interaction: interaction,
          color: colors.Warning,
          author: 'Access denied',
          description: 'Command is restricted'
        })

        return
      }

      if (command.settings.access == 'premium') {
        if (interaction.guild?.id) {
          const guildPremium = client.noirPremiums.get(interaction.guild.id)

          if (!guildPremium || !guildPremium?.status) {
            await client.noirReply.reply({
              interaction: interaction,
              color: colors.Warning,
              author: 'Premium error',
              description: 'Command premium only'
            })

            return
          }

          if (guildPremium.expired()) {
            await client.noirReply.reply({
              interaction: interaction,
              color: colors.Warning,
              author: 'Premium error',
              description: 'Premium has expired'
            })

            return
          }
        }
      }

      command.execute(client, interaction)
    } catch (error: any) {
      client.noirReply.reply({
        interaction: interaction,
        color: colors.Warning,
        author: 'Execution error',
        description: `Unspecified error occurred, please contact us about it, join our [support server](${invite}) for more information`
      })

      throw new Error(chalk.bgRed.white(`${client.noirUtils.capitalize(command.data.name)} command error: `) + '\n' + chalk.red(error.stack))
    }
  }

  protected async button(client: NoirClient, interaction: ButtonInteraction): Promise<void> {
    const parts = interaction.customId.toLocaleLowerCase().split('-')

    if (parts[0] == 'message') await new MessageCommand(client).buttonResponse(client, interaction)
  }

  protected async messageModal(client: NoirClient, interaction: ModalSubmitInteraction | ModalMessageModalSubmitInteraction): Promise<void> {
    const parts = interaction.customId.toLowerCase().split('-')

    if (parts[0] == 'message') await new MessageCommand(client).modalResponse(client, interaction as ModalMessageModalSubmitInteraction)
  }

  protected async selectMenu(client: NoirClient, interaction: SelectMenuInteraction): Promise<void> {
    const parts = interaction.customId.toLowerCase().split('-')

    if (parts[0] == 'message') await new MessageCommand(client).selectResponse(client, interaction)
  }

}