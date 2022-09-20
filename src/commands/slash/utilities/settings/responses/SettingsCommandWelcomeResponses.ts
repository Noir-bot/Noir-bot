import { ButtonInteraction, ModalMessageModalSubmitInteraction, SelectMenuInteraction } from 'discord.js'
import NoirClient from '../../../../../structures/Client'
import SettingsCommandWelcome from '../welcome/SettingsCommandWelcome'
import SettingsCommandWelcomeChannel from '../welcome/SettingsCommandWelcomeChannel'
import SettingsCommandWelcomeEditor from '../welcome/SettingsCommandWelcomeEditor'
import SettingsCommandWelcomeRoles from '../welcome/SettingsCommandWelcomeRoles'
import SettingsCommandWelcomeEditorResponses from './SettingsCommandWelcomeEditorResponses'


export default class SettingsCommandWelcomeResponses {
	public static async button(client: NoirClient, interaction: ButtonInteraction, parts: string[]) {
		const method = parts[2]
		const methodSplit = method.split('.')
		const id = parts[1]

		if (method == 'welcome') {
			await SettingsCommandWelcome.initialMessage(client, interaction, id)
		}

		const welcomeData = client.welcomeSettings.get(id)?.data

		if (!welcomeData) return

		if (method.startsWith('welcomeSave')) {
			await client.welcomeSettings.get(id)?.saveData(client)
			const type = methodSplit[1]

			if (type == 'welcomeEditor') {
				const messageType = methodSplit[2] as 'guild_join' | 'guild_left' | 'direct_join'
				await SettingsCommandWelcomeEditor.initialMessage(client, interaction, id, messageType)
			} else if (type == 'welcomeRoles') {
				await SettingsCommandWelcomeRoles.initialMessage(client, interaction, id)
			} else {
				await SettingsCommandWelcome.initialMessage(client, interaction, id)
			}
		} else if (method.startsWith('welcomeRestore')) {
			await client.welcomeSettings.get(id)?.cacheData(client)
			const type = methodSplit[1]

			if (type == 'welcomeEditor') {
				const messageType = methodSplit[2] as 'guild_join' | 'guild_left' | 'direct_join'
				await SettingsCommandWelcomeEditor.initialMessage(client, interaction, id, messageType)
			} else if (type == 'welcomeRoles') {
				await SettingsCommandWelcomeRoles.initialMessage(client, interaction, id)
			} else {
				await SettingsCommandWelcome.initialMessage(client, interaction, id)
			}
		} else if (method.startsWith('welcomeEditor')) {
			await SettingsCommandWelcomeEditorResponses.button(client, interaction, parts)
		} else if (method == 'welcomeStatus') {
			welcomeData.status = !welcomeData.status
			await SettingsCommandWelcome.initialMessage(client, interaction, id)
		} else if (method == 'welcomeChannel') {
			await SettingsCommandWelcomeChannel.request(client, interaction, id)
		} else if (method == 'welcomeRoles') {
			await SettingsCommandWelcomeRoles.initialMessage(client, interaction, id)
		} else if (method == 'welcomeRolesAdd') {
			await SettingsCommandWelcomeRoles.addRequest(client, interaction, id)
		} else if (method == 'welcomeRolesRemove') {
			await SettingsCommandWelcomeRoles.removeRequest(client, interaction, id)
		}
	}

	public static async modal(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, parts: string[]) {
		const method = parts[2]
		const id = parts[1]

		if (method.startsWith('welcomeEditor')) {
			await SettingsCommandWelcomeEditorResponses.modal(client, interaction, parts)
		} else if (method == 'welcomeChannel') {
			await SettingsCommandWelcomeChannel.response(client, interaction, id)
		} else if (method == 'welcomeRolesAdd') {
			await SettingsCommandWelcomeRoles.addResponse(client, interaction, id)
		}
	}

	public static async selectMenu(client: NoirClient, interaction: SelectMenuInteraction, parts: string[]) {
		const method = parts[2]
		const id = parts[1]

		if (method.startsWith('welcomeEditor')) {
			await SettingsCommandWelcomeEditorResponses.select(client, interaction, parts)
		} else if (method == 'welcomeRolesRemove') {
			await SettingsCommandWelcomeRoles.removeResponse(client, interaction, id)
		}
	}
}