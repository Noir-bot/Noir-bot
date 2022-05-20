import { WarnModel } from '../../models/Warn'
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	Guild,
	MessageActionRowComponentBuilder,
	TextChannel
} from 'discord.js'
import { LogsModel } from '../../models/Logs'
import { colors } from '../../config/design'

export default class NoirWarn {
	static async get(id: string) {
		return await WarnModel.findById(id) ?? null
	}

	static async add(data: { guild: string, user: string, moderator: string, reason?: string, reference?: string }) {
		return await WarnModel.create({
			guild: data.guild,
			user: data.user,
			moderator: data.moderator,
			reason: data?.reason
		})
	}

	static async update(data: { id: string, reason: string }) {
		return await WarnModel.findByIdAndUpdate(data.id, {
			$set: {
				reason: data?.reason
			}
		}) ?? null
	}

	static async remove(id: string) {
		return await WarnModel.findByIdAndDelete(id) ?? null
	}

	static async logs(data: { id: string, guild: Guild, action: 'added' | 'deleted' | 'updated', reason?: string }) {
		const model = (await WarnModel.findById(data.id))?.toObject()

		if (!model) return

		const logs = (await LogsModel.findOne({ guild: data.guild }))?.toObject()
		const channel = (data.guild.channels.cache?.get(logs?.channel!) ?? await data.guild.channels?.fetch(logs?.channel!)) as TextChannel | null

		if (!channel) return

		const member = data.guild.members.cache.get(model.user) ?? await data.guild.members.fetch(model.user)
		const moderator = data.guild.members.cache.get(model.moderator) ?? await data.guild.members.fetch(model.moderator)
		const reference = channel && model.reference ?
			channel.messages.cache?.get(model?.reference) ?? await channel.messages?.fetch(model?.reference) :
			undefined

		const embed = new EmbedBuilder()
			.setAuthor({ name: `Warn logs` })
			.setDescription(`User: ${member.user.username} \`${member.id}\`\n` +
			`Moderator: ${moderator.user.username} \`${moderator.id}\`\n` +
			`Action: ${data.action}\n` +
			`Reason: ${data.reason ? data.reason : model.reason}\n` +
			reference ? `Reference: [Jump to reference](${reference})` : '')

		if (data.action == 'added') embed.setColor(colors.Error)
		else if (data.action == 'updated') embed.setColor(colors.Information)
		else if (data.action == 'deleted') embed.setColor(colors.Secondary)

		const buttons = new ActionRowBuilder<MessageActionRowComponentBuilder>()

		if (data.action == 'added' || data.action == 'updated') {
			buttons.setComponents([
				new ButtonBuilder().setCustomId(`warn-remove-${data.id}`).setLabel('Remove warn').setStyle(ButtonStyle.Danger)
			])
		}

		return await channel.send({ embeds: [embed], components: [buttons] })
	}
}