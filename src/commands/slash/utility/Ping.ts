import NoirCommand from '../../../libs/structures/Command'
import NoirClient from '../../../libs/structures/Client'
import { ApplicationCommandType, CommandInteraction } from 'discord.js'

export default class PingCommand extends NoirCommand {
	constructor(client: NoirClient) {
		super(
			client,
			{
				permissions: 'SendMessages',
				category: 'utility',
				access: 'public',
				type: 'private',
				status: true
			},
			{
				name: 'ping',
				description: 'Ping command',
				type: ApplicationCommandType.ChatInput
			}
		)
	}

	public async execute(client: NoirClient, interaction: CommandInteraction): Promise<void> {
		await client.noirReply.success({
			interaction: interaction,
			content: '🏓 Pong'
		})
	}
}