import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10'
import NoirClient from '../../../libs/structures/Client'
import { ChatInputCommandInteraction } from 'discord.js'
import { PremiumModel } from '../../../models/Premium'
import NoirChatCommand from '../../../libs/structures/commands/ChatCommand'

export default class PremiumCommand extends NoirChatCommand {
	constructor(client: NoirClient) {
		super(
			client,
			{
				permissions: 'SendMessages',
				category: 'utility',
				access: 'private',
				status: true,
				type: 'private'
			},
			{
				name: 'premium',
				description: 'Enable premium features for user',
				type: ApplicationCommandType.ChatInput,
				options: [
					{
						name: 'guild',
						description: 'Premium guild id',
						type: ApplicationCommandOptionType.String,
						required: true
					},
					{
						name: 'duration',
						description: 'Premium duration time',
						type: ApplicationCommandOptionType.String,
						required: true,
						choices: [
							{
								name: 'test',
								value: '5000'
							},
							{
								name: '3 days',
								value: '259200000'
							},
							{
								name: '7 days',
								value: '604800000'
							},
							{
								name: '30 days',
								value: '2592000000'
							},
							{
								name: '90 days',
								value: '7776000000'
							},
							{
								name: '180 days',
								value: '15552000000'
							},
							{
								name: '1 year',
								value: '31560000000'
							}
						]
					}
				]
			}
		)
	}

	public async execute(client: NoirClient, interaction: ChatInputCommandInteraction): Promise<void> {
		const guild = interaction.options.getString('guild', true)
		const duration = interaction.options.getString('duration', true)

		if (!client.guilds.cache.get(guild)?.id || !(await client.guilds.fetch(guild))?.id) {
			await client.noirReply.warning({
				interaction: interaction,
				author: 'Premium error',
				description: 'Guild doesn\'t exists'
			})
		}

		if (await PremiumModel.findOne({ guild: guild })) {
			await client.noirReply.warning({
				interaction: interaction,
				author: 'Premium error',
				description: 'Guild document already exists'
			})

			return
		}

		const expirationDate = new Date(new Date().getTime() + parseInt(duration))

		await PremiumModel.create({
			status: true,
			guild: guild,
			expire: expirationDate
		})

		await client.noirReply.success({
			interaction: interaction,
			author: 'Premium success',
			description: `${client.guilds.cache.get(guild)?.name ?? (await client.guilds?.fetch(guild)).name} got premium till <t:${expirationDate.getTime().toString().slice(0, -3)}:d>`
		})
	}
}