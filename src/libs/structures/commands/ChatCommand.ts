import NoirCommand, { NoirCommandSettings } from './Command'
import NoirClient from '../Client'
import { ChatInputApplicationCommandData, ChatInputCommandInteraction } from 'discord.js'

export default class NoirChatCommand extends NoirCommand {
	public data: ChatInputApplicationCommandData

	constructor(client: NoirClient, settings: NoirCommandSettings, data: ChatInputApplicationCommandData) {
		super(
			client,
			settings
		)

		this.data = data
	}

	public execute(client: NoirClient, interaction: ChatInputCommandInteraction): void {
	}
}