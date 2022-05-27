import NoirCommand, { NoirCommandSettings } from './Command'
import NoirClient from '../Client'
import { ContextMenuCommandInteraction, MessageApplicationCommandData, UserApplicationCommandData } from 'discord.js'

export default class NoirContextMenuCommand extends NoirCommand {
	public data: MessageApplicationCommandData | UserApplicationCommandData

	constructor(client: NoirClient, settings: NoirCommandSettings, data: MessageApplicationCommandData | UserApplicationCommandData) {
		super(
			client,
			settings
		)
		this.data = data
	}

	public execute(client: NoirClient, interaction: ContextMenuCommandInteraction) {
	}
}