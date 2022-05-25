import chalk from 'chalk'
import { CommandInteraction, Interaction } from 'discord.js'
import NoirClient from '../../libs/structures/Client'
import NoirCommand from '../../libs/structures/Command'
import NoirEvent from '../../libs/structures/Event'
import { invite, owners } from '../../config/config'
import { PremiumModel } from '../../models/Premium'

export default class InteractionEvent extends NoirEvent {
	constructor(client: NoirClient) {
		super(client, 'interactionCreate', false)
	}

	public async execute(client: NoirClient, interaction: Interaction): Promise<void> {
		if (interaction.isCommand()) {
			await this.command(client, interaction)
			return
		}

		return
	}

	protected async command(client: NoirClient, interaction: CommandInteraction): Promise<void> {
		const command = client.noirCommands.get(interaction.commandName) as NoirCommand

		try {
			if (client.noirMaintenance && command.data.name != 'maintenance') {
				await client.noirReply.warning({
					interaction: interaction,
					author: 'Maintenance mode',
					description: 'Maintenance mode, try again later'
				})

				return
			}

			if (!command.settings.status) {
				await client.noirReply.warning({
					interaction: interaction,
					author: 'Command error',
					description: 'Command is currently unavailable'
				})

				return
			}

			if (command.settings.permissions && interaction.guild?.members?.me?.permissions.has(command.settings.permissions) && !interaction.guild?.members?.me?.permissions.has('Administrator')) {
				await client.noirReply.warning({
					interaction: interaction,
					author: 'Permissions error',
					description: 'I don\'t have enough permissions'
				})

				return
			}

			if (command.settings.access == 'private' && !owners.includes(interaction.user.id)) {
				await client.noirReply.warning({
					interaction: interaction,
					author: 'Access denied',
					description: 'Command is restricted'
				})

				return
			}

			if (command.settings.access == 'premium') {
				if (!interaction.guild) {
					await client.noirReply.warning({
						interaction: interaction,
						author: 'Premium error',
						description: 'Premium commands are guild only'
					})

					return
				}

				const model = await PremiumModel.findOne({ guild: interaction.guild.id })

				if (!model || model && model.get('status') == false) {
					await client.noirReply.warning({
						interaction: interaction,
						author: 'Premium error',
						description: 'Command is premium only'
					})

					return
				}

				if (model && model.get('status') == true) {
					const expire = new Date(model.get('expire')).getTime()
					const now = new Date().getTime()

					if (expire < now) {
						await PremiumModel.findOneAndDelete({ guild: interaction.guild.id })

						await client.noirReply.warning({
							interaction: interaction,
							author: 'Premium error',
							description: 'Premium has expired'
						})

						return
					}
				}
			}

			command.execute(client, interaction)
		} catch (error: unknown | any) {
			await client.noirReply.warning({
				interaction: interaction,
				author: 'Execution error',
				description: `Unspecified error occurred, please contact us about it, join our [support server](${invite}) for more information`
			})

			console.log(chalk.bgRed.white(`${client.noirUtils.capitalize(command.data.name)} command error: `), chalk.red(error.stack))
		}
	}
}