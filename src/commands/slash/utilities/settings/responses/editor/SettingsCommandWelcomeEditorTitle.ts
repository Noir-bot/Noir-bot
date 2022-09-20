import {
	ActionRowBuilder,
	ButtonInteraction,
	ModalActionRowComponentBuilder,
	ModalBuilder,
	ModalMessageModalSubmitInteraction,
	TextInputBuilder,
	TextInputStyle
} from 'discord.js'
import NoirClient from '../../../../../../structures/Client'
import SettingsCommandWelcomeEditor from '../../welcome/SettingsCommandWelcomeEditor'

export default class SettingsCommandWelcomeEditorTitle {
	public static async request(client: NoirClient, interaction: ButtonInteraction, id: string, type: 'guild_join' | 'guild_left' | 'direct_join') {
		const welcomeData = client.welcomeSettings.get(id)
		let messageData

		if (type == 'guild_join') {
			messageData = welcomeData?.data.messages.guild.join
		} else if (type == 'guild_left') {
			messageData = welcomeData?.data.messages.guild.left
		} else {
			messageData = welcomeData?.data.messages.direct.join
		}

		if (!messageData) return

		const authorInput = new TextInputBuilder()
			.setCustomId(client.componentsUtils.generateId('settings', id, 'title', 'input'))
			.setLabel('Embed title text')
			.setStyle(TextInputStyle.Short)
			.setPlaceholder('Enter embed title')
			.setValue(messageData.embed.title ?? '')
			.setRequired(true)
			.setMaxLength(2000)
			.setMinLength(1)
		const authorImageInput = new TextInputBuilder()
			.setCustomId(client.componentsUtils.generateId('settings', id, 'url', 'input'))
			.setLabel('Embed title url')
			.setStyle(TextInputStyle.Paragraph)
			.setPlaceholder('Enter the title url')
			.setValue(messageData.embed.url ?? '')
			.setRequired(false)
			.setMaxLength(2000)
			.setMinLength(1)

		const actionRows = [
			new ActionRowBuilder<ModalActionRowComponentBuilder>()
				.addComponents(authorInput),
			new ActionRowBuilder<ModalActionRowComponentBuilder>()
				.addComponents(authorImageInput)
		]

		const modal = new ModalBuilder()
			.setCustomId(client.componentsUtils.generateId('settings', id, `welcomeEditorTitle.${type}`, 'modal'))
			.setTitle('Embed title builder')
			.addComponents(actionRows)

		await interaction.showModal(modal)
	}

	public static async response(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string, type: 'guild_join' | 'guild_left' | 'direct_join') {
		const welcomeData = client.welcomeSettings.get(id)
		let messageStatus
		let messageData

		if (type == 'guild_join') {
			messageData = welcomeData?.data.messages.guild.join
		} else if (type == 'guild_left') {
			messageData = welcomeData?.data.messages.guild.left
		} else {
			messageData = welcomeData?.data.messages.direct.join
		}

		if (!messageData) return

		const titleInput = interaction.fields.getTextInputValue(client.componentsUtils.generateId('settings', id, 'title', 'input'))
		const urlInput = interaction.fields.getTextInputValue(client.componentsUtils.generateId('settings', id, 'url', 'input'))

		messageData.embed.title = client.utils.formatValue(titleInput)

		if (urlInput) {
			messageData.embed.url = client.utils.formatValue(client.utils.formatURL(urlInput))
		}

		await SettingsCommandWelcomeEditor.initialMessage(client, interaction, id, type)
	}
}