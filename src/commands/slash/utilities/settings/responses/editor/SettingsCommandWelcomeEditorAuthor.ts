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

export default class SettingsCommandWelcomeEditorAuthor {
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
			.setCustomId(client.componentsUtils.generateId('settings', id, 'author', 'input'))
			.setLabel('Embed author text')
			.setStyle(TextInputStyle.Short)
			.setPlaceholder('Enter embed author text')
			.setValue(messageData.embed.author ?? '')
			.setRequired(true)
			.setMaxLength(2000)
			.setMinLength(1)
		const authorImageInput = new TextInputBuilder()
			.setCustomId(client.componentsUtils.generateId('settings', id, 'authorImage', 'input'))
			.setLabel('Embed author image')
			.setStyle(TextInputStyle.Paragraph)
			.setPlaceholder('Image URL or server, user, client')
			.setValue(messageData.embed.rawAuthorImage ?? '')
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
			.setCustomId(client.componentsUtils.generateId('settings', id, `welcomeEditorAuthor.${type}`, 'modal'))
			.setTitle('Embed author builder')
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

		const authorInput = interaction.fields.getTextInputValue(client.componentsUtils.generateId('settings', id, 'author', 'input'))
		const authorImageInput = interaction.fields.getTextInputValue(client.componentsUtils.generateId('settings', id, 'authorImage', 'input'))

		messageData.embed.author = client.utils.formatValue(authorInput)

		if (authorImageInput) {
			messageData.embed.rawAuthorImage = client.utils.formatValue(authorImageInput)
			messageData.embed.authorImage = client.utils.formatImage(interaction, authorImageInput)
		}

		await SettingsCommandWelcomeEditor.initialMessage(client, interaction, id, type)
	}
}