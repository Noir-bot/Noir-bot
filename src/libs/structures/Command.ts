import {
	ChatInputApplicationCommandData,
	CommandInteraction,
	ContextMenuCommandInteraction,
	MessageApplicationCommandData,
	PermissionResolvable,
	UserApplicationCommandData
} from 'discord.js'
import NoirClient from './Client'

export default abstract class NoirCommand {
	public client: NoirClient
	public settings: NoirCommandSettings
	public data: ChatInputApplicationCommandData | UserApplicationCommandData | MessageApplicationCommandData

	protected constructor(client: NoirClient, settings: NoirCommandSettings, data: ChatInputApplicationCommandData | UserApplicationCommandData | MessageApplicationCommandData) {
		this.client = client
		this.settings = {
			permissions: settings.permissions,
			category: settings.category,
			access: settings.access,
			type: settings.type,
			status: settings.status
		}
		this.data = {
			name: data.name,
			type: data.type,
			options: (data as ChatInputApplicationCommandData)?.options,
			description: (data as ChatInputApplicationCommandData)?.description
		}
	}

	public abstract execute(client: NoirClient, interaction: CommandInteraction | ContextMenuCommandInteraction): void
}

interface NoirCommandSettings {
	permissions: PermissionResolvable
	category: NoirCommandCategory
	access: NoirCommandAccess
	type: NoirCommandType
	status: boolean
}

type NoirCommandCategory = 'overall' | 'moderation' | 'information' | 'utility'
type NoirCommandAccess = 'public' | 'moderation' | 'premium' | 'private'
type NoirCommandType = 'public' | 'private'