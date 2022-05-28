import NoirClient from '../structures/Client'
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ChatInputCommandInteraction,
	ContextMenuCommandInteraction,
	EmbedBuilder,
	GuildMember,
	TextChannel,
	User
} from 'discord.js'
import { durationRegex } from '../../config/config'
import { RestrictionModel } from '../../models/Restriction'
import { LogsModel } from '../../models/Logs'
import { colors } from '../../config/design'
import { MessageActionRowComponentBuilder } from '@discordjs/builders'

export default class RestrictionAdd {
	public static async execute(client: NoirClient, interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction, properties: { member: GuildMember, reason?: string, duration?: string }) {
		if (!await this.handleErrors(client, interaction, {
			member: properties.member,
			duration: properties.duration
		})) return

		await properties.member.timeout(60000 * 60 * 24 * 14, properties.reason).catch(async () => {
			await client.noirReply.warning({
				interaction: interaction,
				author: 'Permissions error',
				description: 'User can\'t be restricted'
			})

			return
		})

		const model = await this.createModel(client, interaction, {
			member: properties.member,
			duration: properties.duration,
			reason: properties.reason
		})

		const channel = await this.handleLogsErrors(client, interaction)
		const restrictedAt = model?._id.getTimestamp()
		const id = model?.id

		if (channel && model && id && restrictedAt) {
			await this.creationLogs(client, interaction, channel, {
				user: properties.member.user,
				duration: properties.duration,
				reason: properties.reason,
				id: id,
				restrictedAt: restrictedAt
			})
		}

		if (properties.duration && channel && model) {
			await this.removeRestriction(client, interaction, {
				member: properties.member,
				restrictedAt: model.id.getTimestamp(),
				reason: properties.reason,
				id: model.id,
				duration: properties.duration,
				channel: channel
			})
		}
	}

	private static async handleErrors(client: NoirClient, interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction, properties: { member: GuildMember, duration?: string }) {
		if (!interaction.guild) {
			await client.noirReply.warning({
				interaction: interaction,
				author: 'Undefined guild',
				description: 'Can\'t find the guild'
			})

			return
		}

		if (properties.member.user.bot) {
			await client.noirReply.warning({
				interaction: interaction,
				author: 'User error',
				description: 'Bot can\'t be restricted'
			})

			return
		}

		if (interaction.user.bot) {
			await client.noirReply.warning({
				interaction: interaction,
				author: 'User error',
				description: 'Bot can\'t restrict'
			})

			return
		}

		if (properties.duration && !durationRegex.test(properties.duration)) {
			await client.noirReply.warning({
				interaction: interaction,
				author: 'Duration error',
				description: 'Invalid duration form, duration limit is 2 weeks'
			})

			return
		}

		return true
	}

	private static async createModel(client: NoirClient, interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction, properties: { member: GuildMember, reason?: string, duration?: string }) {
		if (!interaction.guild) return

		return await RestrictionModel.create({
			user: properties.member.id,
			guild: interaction.guild.id,
			moderator: interaction.user.id,
			duration: properties.duration?.toLowerCase(),
			reason: properties.reason
		})
	}

	private static async handleLogsErrors(client: NoirClient, interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction) {
		if (!interaction.guild) return

		const model = (await LogsModel.findOne({ guild: interaction.guild.id }))?.toObject()

		if (!model) return
		if (!model.status.overall) return
		if (!model.status.restriction) return
		if (!model.channel) return

		return (interaction.guild.channels.cache.get(model.channel) ?? await interaction.guild.channels.fetch(model.channel)) as TextChannel
	}

	private static async creationLogs(client: NoirClient, interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction, channel: TextChannel, properties: { user: User, id: string, duration?: string, reason?: string, restrictedAt: Date }) {
		const embed = new EmbedBuilder()
			.setAuthor({ name: 'Restriction add' })
			.setFooter({ text: `${properties.id}` })
			.setColor(colors.Secondary)
			.setDescription(
				`User: ${properties.user} \`${properties.user.id}\`\n` +
				`Moderator: ${interaction.user} \`${interaction.user.id}\`\n` +
				properties.duration ? `Duration: ${properties.duration}\n` : '' +
				properties.reason ? `Reason: ${properties.reason}\n` : '' +
					`Restricted at: <t:${properties.restrictedAt.getTime().toString().slice(0, -3)}:d> <t:${properties.restrictedAt.getTime().toString().slice(0, -3)}:R>`
			)
		const button = new ButtonBuilder().setLabel('Remove restriction').setCustomId(`restriction-remove-${properties.id}`).setStyle(ButtonStyle.Danger)
		const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([button])

		await channel.send({
			embeds: [embed],
			components: [actionRow]
		})
	}

	private static async removeLogs(client: NoirClient, interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction | ButtonInteraction, channel: TextChannel, properties: { user: User, id: string, duration?: string, reason?: string, restrictedAt: Date }) {
		const embed = new EmbedBuilder()
			.setAuthor({ name: 'Restriction remove' })
			.setFooter({ text: `${properties.id}` })
			.setColor(colors.Secondary)
			.setDescription(
				`User: ${properties.user} \`${properties.user.id}\`\n` +
				`Moderator: ${interaction.user} \`${interaction.user.id}\`\n` +
				properties.duration ? `Duration: ${properties.duration}\n` : '' +
				properties.reason ? `Reason: ${properties.reason}\n` : '' +
					`Restricted at: <t:${properties.restrictedAt.getTime().toString().slice(0, -3)}:d> <t:${properties.restrictedAt.getTime().toString().slice(0, -3)}:R>\n` +
					`Unrestricted at: <t:${new Date().getTime().toString().slice(0, -3)}:d> <t:${new Date().getTime().toString().slice(0, -3)}:R>`
			)

		await channel.send({
			embeds: [embed]
		})
	}

	private static async removeRestriction(client: NoirClient, interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction | ButtonInteraction, properties: { member: GuildMember, duration: string, channel: TextChannel, reason?: string, id: string, restrictedAt: Date }) {
		client.noirUtils.wait(properties.duration).then(async () => {
			if (!properties.member.communicationDisabledUntilTimestamp) return

			await properties.member.timeout(0, 'Remove restriction').then(async () => {
				await this.removeLogs(client, interaction, properties.channel, {
					user: properties.member.user,
					id: properties.id,
					duration: properties.duration,
					reason: properties.reason,
					restrictedAt: properties.restrictedAt
				})
			}).catch(() => {
				return
			})
		})
	}
}