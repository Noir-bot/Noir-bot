import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ChatInputCommandInteraction,
	GuildMember
} from 'discord.js'
import NoirClient from '../../../libs/structures/Client'
import RestrictionAdd from '../../../libs/restriction/Add'
import NoirChatCommand from '../../../libs/structures/commands/ChatCommand'

export default class RestrictionCommand extends NoirChatCommand {
	constructor(client: NoirClient) {
		super(
			client,
			{
				permissions: ['ManageRoles', 'SendMessages', 'EmbedLinks', 'MuteMembers'],
				category: 'moderation',
				access: 'moderation',
				type: 'private',
				status: true
			},
			{
				name: 'restriction',
				description: 'Restriction methods',
				type: ApplicationCommandType.ChatInput,
				options: [
					{
						name: 'add',
						description: 'Add restriction',
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: 'user',
								description: 'User to restrict',
								type: ApplicationCommandOptionType.User,
								required: true
							},
							{
								name: 'duration',
								description: 'Duration of the restriction',
								type: ApplicationCommandOptionType.String,
								required: true
							},
							{
								name: 'reason',
								description: 'Reason for the restriction',
								type: ApplicationCommandOptionType.String
							}
						]
					},
					{
						name: 'remove',
						description: 'Remove restriction',
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: 'user',
								description: 'User to remove restriction from',
								type: ApplicationCommandOptionType.User,
								required: true
							}
						]
					},
					{
						name: 'delete',
						description: 'Delete restriction from history',
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: 'id',
								description: 'Restriction id',
								type: ApplicationCommandOptionType.String,
								required: true
							}
						]
					}
				]
			}
		)
	}

	public async execute(client: NoirClient, interaction: ChatInputCommandInteraction): Promise<void> {
		const command = interaction.options.getSubcommand(true)

		if (command == 'add') {
			const member = interaction.options.getMember('user')
			const duration = interaction.options.getString('duration', true)
			const reason = interaction.options.getString('reason') as string | undefined

			await RestrictionAdd.execute(client, interaction, {
				member: member as GuildMember,
				duration: duration,
				reason: reason
			})
		}
	}
}