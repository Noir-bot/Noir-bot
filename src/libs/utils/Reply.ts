import {
	ActionRow,
	ButtonInteraction,
	ColorResolvable,
	CommandInteraction,
	ContextMenuCommandInteraction,
	EmbedBuilder,
	EmbedField,
	MessageActionRowComponent
} from 'discord.js'
import { colors } from '../../config/design'
import NoirClient from '../structures/Client'

export default class NoirReply {
	public client: NoirClient

	constructor(client: NoirClient) {
		this.client = client
	}

	public async warning(properties: {
		interaction: CommandInteraction | ContextMenuCommandInteraction | ButtonInteraction,
		components?: [ActionRow<MessageActionRowComponent>]
		author?: string,
		authorImage?: string,
		description?: string,
		color?: ColorResolvable,
		fields?: EmbedField[],
		footer?: string,
		footerImage?: string,
		thumbnail?: string,
		image?: string,
		content?: string,
		ephemeral?: boolean,
		fetch?: boolean
	}) {
		const embed = this.build({
			color: properties.color ?? colors.Error,
			author: properties.author ?? 'Error',
			description: properties.description ?? 'Unspecified error occurred',
			footer: properties.footer,
			authorImage: properties.authorImage,
			footerImage: properties.footerImage,
			thumbnail: properties.thumbnail,
			image: properties.image,
			fields: properties.fields
		})

		return await this.reply({
			interaction: properties.interaction,
			content: properties.content,
			embed: embed,
			components: properties.components,
			ephemeral: properties.ephemeral ?? true,
			fetch: properties.fetch ?? false
		})
	}

	public async success(properties: {
		interaction: CommandInteraction | ContextMenuCommandInteraction | ButtonInteraction,
		components?: [ActionRow<MessageActionRowComponent>]
		author?: string,
		authorImage?: string,
		description?: string,
		color?: ColorResolvable,
		fields?: EmbedField[],
		footer?: string,
		footerImage?: string,
		thumbnail?: string,
		image?: string,
		content?: string,
		ephemeral?: boolean,
		fetch?: boolean
	}) {
		const embed = this.build({
			color: properties.color ?? colors.Success,
			author: properties.author ?? 'Success',
			description: properties.description ?? 'Successfully done',
			footer: properties.footer,
			authorImage: properties.authorImage,
			footerImage: properties.footerImage,
			thumbnail: properties.thumbnail,
			image: properties.image,
			fields: properties.fields
		})

		return await this.reply({
			interaction: properties.interaction,
			content: properties.content,
			embed: embed,
			components: properties.components,
			ephemeral: properties.ephemeral ?? true,
			fetch: properties.fetch ?? false
		})
	}

	protected build(
		properties: {
			author: string,
			authorImage?: string,
			description: string,
			fields?: EmbedField[],
			color: ColorResolvable,
			footer?: string,
			footerImage?: string,
			thumbnail?: string
			image?: string,
		}
	): EmbedBuilder {
		const embed = new EmbedBuilder()
			.setAuthor({ name: properties.author, iconURL: properties.authorImage })
			.setDescription(properties.description)
			.setColor(properties.color)

		if (properties.footer) embed.setFooter({ text: properties.footer, iconURL: properties.footerImage })
		if (properties.thumbnail) embed.setThumbnail(properties.thumbnail)
		if (properties.image) embed.setImage(properties.image)
		if (properties.fields) embed.addFields(properties.fields)

		return embed
	}

	private async reply(
		properties: {
			interaction: CommandInteraction | ContextMenuCommandInteraction | ButtonInteraction,
			embed?: EmbedBuilder,
			components?: [ActionRow<MessageActionRowComponent>],
			ephemeral: boolean,
			content?: string,
			fetch: boolean
		}
	) {
		return await properties.interaction.reply({
			embeds: properties.embed?.data ? [properties.embed.data] : [],
			components: properties?.components ?? [],
			content: properties?.content,
			ephemeral: properties?.ephemeral,
			fetchReply: properties.fetch ?? false
		}).catch(async () => {
			if (properties.interaction.isButton()) {
				await properties.interaction.update({
					embeds: properties.embed?.data ? [properties.embed.data] : [],
					components: properties?.components ?? [],
					content: properties?.content,
					fetchReply: properties.fetch ?? false
				})
			} else if (properties.interaction.isCommand()) {
				await properties.interaction.editReply({
					embeds: properties.embed?.data ? [properties.embed.data] : [],
					components: properties?.components ?? [],
					content: properties?.content
				})
			}
		})
	}
}