import chalk from 'chalk'
import { ButtonInteraction, CommandInteraction, Interaction, ModalSubmitInteraction } from 'discord.js'
import HelpCommand from '../../commands/slash/information/Help'
import AnnouncementCommand from '../../commands/slash/private/Announcement'
import MessageCommand from '../../commands/slash/private/Message'
import { colors } from '../../libs/config/design'
import { invite, owners } from '../../libs/config/settings'
import NoirClient from '../../libs/structures/Client'
import NoirCommand from '../../libs/structures/command/Command'
import NoirEvent from '../../libs/structures/event/Event'

export default class InteractionEvent extends NoirEvent {
  constructor(client: NoirClient) {
    super(client, 'interactionCreate', false)
  }

  public async execute(client: NoirClient, interaction: Interaction): Promise<void> {
    if (interaction.isCommand()) await this.command(client, interaction)
    else if (interaction.isButton()) await this.button(client, interaction)
    else if (interaction.isModalSubmit()) await this.modal(client, interaction)

    return
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
        if (!interaction.guild) {
          await client.noirReply.reply({
            interaction: interaction,
            color: colors.Warning,
            author: 'Premium error',
            description: 'Premium commands are guild only'
          })

          return
        }

        const model = await client.noirPrisma.premium.findFirst({ where: { guild: interaction.guild.id } })

        if (!model || model && model.status == false) {
          await client.noirReply.reply({
            interaction: interaction,
            color: colors.Warning,
            author: 'Premium error',
            description: 'Command is premium only'
          })

          return
        }

        if (model && model.status == true) {
          const expire = model.expireAt.getTime()
          const now = new Date().getTime()

          if (expire < now) {
            await client.noirPrisma.premium.deleteMany({ where: { guild: interaction.guild.id } })

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
      await client.noirReply.reply({
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

    if (parts[0] == 'help') {
      if (parts[1] == 'faq') {
        await new HelpCommand(client).faq(client, interaction)
      } else {
        await new HelpCommand(client).execute(client, interaction)
      }
    } else if (parts[0] == 'message') await new MessageCommand(client).buttonResponse(client, interaction)

    return
  }

  protected async modal(client: NoirClient, interaction: ModalSubmitInteraction): Promise<void> {
    // await interaction.deferReply({ ephemeral: true, fetchReply: true })
    const parts = interaction.customId.toLowerCase().split('-')

    if (parts[0] == 'announcement') await new AnnouncementCommand(client).response(client, interaction)
    else if (parts[0] == 'message') await new MessageCommand(client).modalResponse(client, interaction)
  }
}