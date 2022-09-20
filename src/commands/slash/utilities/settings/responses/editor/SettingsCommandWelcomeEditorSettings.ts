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

export default class SettingsCommandWelcomeEditorSettings {
	public static async request(client: NoirClient, interaction: ButtonInteraction, id: string, type: 'guild_join' | 'guild_left' | 'direct_join'): Promise<void> {
		const welcomeData = client.welcomeSettings.get(id)
		let messageStatus
		let messageData

		if (type == 'guild_join') {
			messageData = welcomeData?.data.messages.guild.join
			messageStatus = welcomeData?.data.messages.guild.status
		} else if (type == 'guild_left') {
			messageData = welcomeData?.data.messages.guild.left
			messageStatus = welcomeData?.data.messages.guild.status
		} else {
			messageData = welcomeData?.data.messages.direct.join
			messageStatus = welcomeData?.data.messages.direct.status
		}

		if (!messageData) return

		const colorInput = new TextInputBuilder()
			.setCustomId(client.componentsUtils.generateId('settings', id, 'color', 'input'))
			.setLabel('Embed color')
			.setStyle(TextInputStyle.Short)
			.setPlaceholder('Green, gray, yellow, cyan, red, embed or color hex')
			.setValue(messageData.embed.rawColor ?? '')
			.setRequired(false)
			.setMaxLength(10)
			.setMinLength(1)
		const descriptionInput = new TextInputBuilder()
			.setCustomId(client.componentsUtils.generateId('settings', id, 'description', 'input'))
			.setLabel('Embed description')
			.setStyle(TextInputStyle.Paragraph)
			.setPlaceholder('Enter the description')
			.setValue(messageData.embed.description ?? '')
			.setRequired(false)
			.setMaxLength(2000)
			.setMinLength(1)
		const imageInput = new TextInputBuilder()
			.setCustomId(client.componentsUtils.generateId('settings', id, 'image', 'input'))
			.setLabel('Embed image')
			.setStyle(TextInputStyle.Short)
			.setPlaceholder('Image URL or server, user, client')
			.setValue(messageData.embed.rawImage ?? '')
			.setRequired(false)
			.setMaxLength(2000)
			.setMinLength(1)
		const thumbnailInput = new TextInputBuilder()
			.setCustomId(client.componentsUtils.generateId('settings', id, 'thumbnail', 'input'))
			.setLabel('Embed thumbnail')
			.setStyle(TextInputStyle.Short)
			.setPlaceholder('Image URL or server, user, client')
			.setValue(messageData.embed.rawThumbnail ?? '')
			.setRequired(false)
			.setMaxLength(2000)
			.setMinLength(1)
		const timestampInput = new TextInputBuilder()
			.setCustomId(client.componentsUtils.generateId('settings', id, 'timestamp', 'input'))
			.setLabel('Embed timestamp')
			.setStyle(TextInputStyle.Short)
			.setPlaceholder('True or false')
			.setValue(messageData.embed.timestamp ? 'True' : 'False')
			.setRequired(false)
			.setMaxLength(5)
			.setMinLength(4)

		const actionRows = [
			new ActionRowBuilder<ModalActionRowComponentBuilder>()
				.addComponents(colorInput),
			new ActionRowBuilder<ModalActionRowComponentBuilder>()
				.addComponents(descriptionInput),
			new ActionRowBuilder<ModalActionRowComponentBuilder>()
				.addComponents(imageInput),
			new ActionRowBuilder<ModalActionRowComponentBuilder>()
				.addComponents(thumbnailInput),
			new ActionRowBuilder<ModalActionRowComponentBuilder>()
				.addComponents(timestampInput)
		]

		const modal = new ModalBuilder()
			.setCustomId(client.componentsUtils.generateId('settings', id, `welcomeEditorSettings.${type}`, 'modal'))
			.setTitle('Embed settings')
			.addComponents(actionRows)

		await interaction.showModal(modal)
	}

	public static async response(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string, type: 'guild_join' | 'guild_left' | 'direct_join'): Promise<void> {
		const welcomeData = client.welcomeSettings.get(id)
		let messageStatus
		let messageData

		if (type == 'guild_join') {
			messageData = welcomeData?.data.messages.guild.join
			messageStatus = welcomeData?.data.messages.guild.status
		} else if (type == 'guild_left') {
			messageData = welcomeData?.data.messages.guild.left
			messageStatus = welcomeData?.data.messages.guild.status
		} else {
			messageData = welcomeData?.data.messages.direct.join
			messageStatus = welcomeData?.data.messages.direct.status
		}

		if (!messageData) return

		const colorInput = interaction.fields.getTextInputValue(client.componentsUtils.generateId('settings', id, 'color', 'input'))
		const descriptionInput = interaction.fields.getTextInputValue(client.componentsUtils.generateId('settings', id, 'description', 'input'))
		const imageInput = interaction.fields.getTextInputValue(client.componentsUtils.generateId('settings', id, 'image', 'input'))
		const thumbnailInput = interaction.fields.getTextInputValue(client.componentsUtils.generateId('settings', id, 'thumbnail', 'input'))
		const timestampInput = interaction.fields.getTextInputValue(client.componentsUtils.generateId('settings', id, 'timestamp', 'input'))

		if (colorInput) {
			messageData.embed.rawColor = colorInput
			messageData.embed.color = client.utils.formatColor(colorInput)
		}

		if (descriptionInput) {
			messageData.embed.description = client.utils.formatValue()
		}

		if (imageInput) {
			messageData.embed.rawImage = imageInput
			messageData.embed.image = client.utils.formatImage(interaction, imageInput)
		}

		if (thumbnailInput) {
			messageData.embed.rawThumbnail = thumbnailInput
			messageData.embed.thumbnail = client.utils.formatImage(interaction, thumbnailInput)
		}

		if (timestampInput) {
			messageData.embed.timestamp = client.utils.formatBoolean(timestampInput)
		}

		await SettingsCommandWelcomeEditor.initialMessage(client, interaction, id, type)
	}
}