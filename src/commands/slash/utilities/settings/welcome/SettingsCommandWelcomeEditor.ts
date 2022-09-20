import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	MessageActionRowComponentBuilder,
	ModalMessageModalSubmitInteraction,
	SelectMenuBuilder,
	SelectMenuInteraction
} from 'discord.js'
import Colors from '../../../../../constants/Colors'
import Options from '../../../../../constants/Options'
import NoirClient from '../../../../../structures/Client'

export default class SettingsCommandWelcomeEditor {
	public static async initialMessage(client: NoirClient, interaction: ButtonInteraction | ModalMessageModalSubmitInteraction | SelectMenuInteraction, id: string, type: 'guild_join' | 'guild_left' | 'direct_join' = 'guild_join') {
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

		const embedStatus = messageData?.embed.color || messageData?.embed.description || messageData?.embed.image || messageData?.embed.thumbnail || messageData?.embed.timestamp

		const buttons = [
			[
				new ButtonBuilder()
					.setCustomId(client.componentsUtils.generateId('settings', id, `welcomeEditorSettings.${type}`, 'button'))
					.setLabel('Embed settings')
					.setStyle(client.componentsUtils.generateStyle(embedStatus))
					.setDisabled(!messageStatus),
				new ButtonBuilder()
					.setCustomId(client.componentsUtils.generateId('settings', id, `welcomeEditorAuthor.${type}`, 'button'))
					.setLabel('Embed author')
					.setStyle(client.componentsUtils.generateStyle(messageData?.embed.author || messageData?.embed.authorImage))
					.setDisabled(!messageStatus),
				new ButtonBuilder()
					.setCustomId(client.componentsUtils.generateId('settings', id, `welcomeEditorTitle.${type}`, 'button'))
					.setLabel('Embed title')
					.setStyle(client.componentsUtils.generateStyle(messageData?.embed.title || messageData?.embed.url))
					.setDisabled(!messageStatus),
				new ButtonBuilder()
					.setCustomId(client.componentsUtils.generateId('settings', id, `welcomeEditorFooter.${type}`, 'button'))
					.setLabel('Embed footer')
					.setStyle(client.componentsUtils.generateStyle(messageData?.embed.footer || messageData?.embed.footerImage))
					.setDisabled(!messageStatus)
			],
			[
				new ButtonBuilder()
					.setCustomId(client.componentsUtils.generateId('settings', id, `welcomeEditorAddField.${type}`, 'button'))
					.setLabel('Add embed field')
					.setStyle(client.componentsUtils.defaultStyle)
					.setDisabled(!messageStatus || messageData?.embed.fields.length == 25 || !client.utils.premiumStatus(id))
					.setEmoji(Options.premiumEmoji),
				new ButtonBuilder()
					.setCustomId(client.componentsUtils.generateId('settings', id, `welcomeEditorRemoveFields.${type}`, 'button'))
					.setLabel('Remove embed fields')
					.setStyle(client.componentsUtils.defaultStyle)
					.setDisabled(!messageStatus || messageData?.embed.fields.length == 0)
					.setEmoji(Options.premiumEmoji),
				new ButtonBuilder()
					.setCustomId(client.componentsUtils.generateId('settings', id, `welcomeEditorEditFields.${type}`, 'button'))
					.setLabel('Edit embed fields')
					.setStyle(client.componentsUtils.defaultStyle)
					.setDisabled(!messageStatus || messageData?.embed.fields.length == 0 || !client.utils.premiumStatus(id))
					.setEmoji(Options.premiumEmoji)
			],
			[
				new ButtonBuilder()
					.setCustomId(client.componentsUtils.generateId('settings', id, `welcomeEditorStatus.${type}`, 'button'))
					.setLabel(`${messageStatus ? 'Disable' : 'Enable'} auto messages`)
					.setStyle(client.componentsUtils.generateStyle(messageStatus)),
				new ButtonBuilder()
					.setCustomId(client.componentsUtils.generateId('settings', id, `welcomeEditorMessage.${type}`, 'button'))
					.setLabel('Message content')
					.setStyle(client.componentsUtils.generateStyle(messageData?.message))
					.setDisabled(!messageStatus)
			],
			[
				client.componentsUtils.generateBack('settings', id, 'welcome'),
				client.componentsUtils.generateSave('settings', id, `welcomeSave.welcomeEditor.${type}`),
				client.componentsUtils.generateRestore('settings', id, `welcomeRestore.welcomeEditor.${type}`),
				client.componentsUtils.generateExample('settings', id, `welcomeExample.welcomeEditor.${type}`)
			]
		]

		const selectMenu = new SelectMenuBuilder()
			.setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeEditor', 'select'))
			.setPlaceholder('Choose role(s) to remove')
			.setMaxValues(1)
			.setMinValues(1)
			.setOptions(
				{
					label: 'Guild join',
					description: 'Guild join message settings',
					value: 'guild_join',
					default: type == 'guild_join'
				},
				{
					label: 'Guild left',
					description: 'Guild left message settings',
					value: 'guild_left',
					default: type == 'guild_left'
				},
				{
					label: 'Direct join',
					description: 'Direct join message settings',
					value: 'direct_join',
					default: type == 'direct_join'
				}
			)

		const actionRows = [
			new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(selectMenu),
			new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[0]),
			new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[1]),
			new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[2]),
			new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[3])
		]

		await client.reply.reply({
			interaction: interaction,
			color: Colors.primary,
			author: 'Welcome message editor',
			authorImage: Options.clientAvatar,
			description: 'Welcome message editor. Choose message type and setup with our advanced message editor',
			components: actionRows,
			ephemeral: true
		})
	}

	public static async selectResponse(client: NoirClient, interaction: SelectMenuInteraction, id: string) {
		const type = interaction.values[0] as 'guild_join' | 'guild_left' | 'direct_join'
		await this.initialMessage(client, interaction, id, type)
	}
}