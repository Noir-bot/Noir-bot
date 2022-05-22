import NoirCommand from '../../../libs/structures/Command'
import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10'
import NoirClient from '../../../libs/structures/Client'
import { ChatInputCommandInteraction } from 'discord.js'
import { PremiumModel } from '../../../models/Premium'

export default class PremiumCommand extends NoirCommand {
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
						name: 'user',
						description: 'Premium user id',
						type: ApplicationCommandOptionType.String,
						required: true
					},
					{
						name: 'duration',
						description: 'Premium duration time',
						type: ApplicationCommandOptionType.String,
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
		const id = interaction.options.getString('user', true)
		const duration = interaction.options.getString('duration', true)
		const expirationDate = new Date(new Date().getTime() + parseInt(duration))

		if (await PremiumModel.findOne({ user: id })) {
			await client.noirReply.warning({
				interaction: interaction,
				author: 'Premium error',
				description: 'User document already exists'
			})

			return
		}

		await PremiumModel.create({
			status: true,
			user: id,
			expire: expirationDate
		})

		await client.noirReply.success({
			interaction: interaction,
			author: 'Premium success',
			description: `${client.users.cache?.get(id)?.username ?? (await client.users?.fetch(id))?.username ?? 'Undefined user'} got premium for ${duration}`
		})
	}
}