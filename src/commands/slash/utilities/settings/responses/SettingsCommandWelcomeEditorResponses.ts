import { ButtonInteraction, ModalMessageModalSubmitInteraction, SelectMenuInteraction } from 'discord.js'
import NoirClient from '../../../../../structures/Client'
import SettingsCommandWelcomeEditor from '../welcome/SettingsCommandWelcomeEditor'
import SettingsCommandWelcomeEditorSettings from './editor/SettingsCommandWelcomeEditorSettings'

export default class SettingsCommandWelcomeEditorResponses {
	public static async button(client: NoirClient, interaction: ButtonInteraction, parts: string[]) {
		const method = parts[2]
		const messageType = method.split('.')[1] as 'guild_join' | 'guild_left' | 'direct_join'
		const id = parts[1]

		const welcomeData = client.welcomeSettings.get(id)?.data

		if (!welcomeData) return

		if (method == 'welcomeEditor') {
			await SettingsCommandWelcomeEditor.initialMessage(client, interaction, id)
		} else if (method.startsWith('welcomeEditorStatus')) {
			if (messageType == 'guild_join' || messageType == 'guild_left') {
				welcomeData.messages.guild.status = !welcomeData.messages.guild.status
				await SettingsCommandWelcomeEditor.initialMessage(client, interaction, id, messageType)
			} else {
				welcomeData.messages.direct.status = !welcomeData.messages.direct.status
				await SettingsCommandWelcomeEditor.initialMessage(client, interaction, id, messageType)
			}
		} else if (method.startsWith('welcomeEditorSettings')) {
			await SettingsCommandWelcomeEditorSettings.request(client, interaction, id, messageType)
		}
	}

	public static async select(client: NoirClient, interaction: SelectMenuInteraction, parts: string[]) {
		const method = parts[2]
		const id = parts[1]

		if (method == 'welcomeEditor') {
			await SettingsCommandWelcomeEditor.selectResponse(client, interaction, id)
		}
	}

	public static async modal(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, parts: string[]) {
		const method = parts[2]
		const messageType = method.split('.')[1] as 'guild_join' | 'guild_left' | 'direct_join'
		const id = parts[1]

		const welcomeData = client.welcomeSettings.get(id)?.data

		if (!welcomeData) return

		if (method.startsWith('welcomeEditorSettings')) {
			await SettingsCommandWelcomeEditorSettings.response(client, interaction, id, messageType)
		}
	}
}