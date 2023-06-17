import Colors from '@constants/Colors'
import Emojis from '@constants/Emojis'
import Reply from '@helpers/Reply'
import Client from '@structures/Client'
import ChatCommand from '@structures/commands/ChatCommand'
import { AccessType, CommandCategory, CommandType } from '@structures/commands/Command'
import Moderation from '@structures/moderation/Moderation'
import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction, channelMention, time } from 'discord.js'

export default class PurgeCommand extends ChatCommand {
  constructor(client: Client) {
    super(
      client,
      {
        permissions: ['ManageMessages', 'EmbedLinks'],
        category: CommandCategory.Moderation,
        access: AccessType.Moderation,
        type: CommandType.Public,
        status: true,
        rateLimit: 5
      },
      {
        name: 'purge',
        description: 'Purge messages',
        options: [
          {
            name: 'amount',
            description: 'Amount of messages to purge',
            type: ApplicationCommandOptionType.Integer,
            required: true
          },
          {
            name: 'reason',
            description: 'Reason for purging messages',
            type: ApplicationCommandOptionType.String,
            required: false
          }
        ],
        defaultMemberPermissions: ['ManageMessages'],
        type: ApplicationCommandType.ChatInput,
        dmPermission: false,
      }
    )
  }

  public async execute(client: Client, interaction: ChatInputCommandInteraction<'cached'>) {
    const amount = interaction.options.getInteger('amount')
    const reason = interaction.options.getString('reason')
    const deletedAt = new Date()

    if (!amount) return

    const deleted = await interaction.channel?.bulkDelete(amount, true)

    Reply.reply({
      client,
      interaction,
      color: Colors.success,
      author: 'Message purge',
      authorImage: client.user?.avatarURL(),
      description: `${amount} message${amount > 1 ? 's' : ''} has been successfully purged from ${channelMention(interaction.channelId)}`,
    })

    const webhookURL = (await Moderation.cache(client, interaction.guildId)).webhook

    if (webhookURL) {
      const webhook = await Moderation.getWebhook(client, webhookURL)

      const description = `${Emojis.channel} Channel: ${channelMention(interaction.channelId)}\n` +
        `${Emojis.user} Moderator: ${interaction.user}\n` +
        `${Emojis.welcome} Amount: \`${amount}\`\n` +
        `${reason ? `${Emojis.document} Reason: ${reason}\n` : ''}` +
        `${Emojis.time} Purged at: ${time(deletedAt, 'd')} (${time(deletedAt, 'R')})`

      if (webhook) {
        Reply.sendWebhook({
          client,
          webhook,
          color: Colors.logsGuild,
          author: 'Message purge',
          description,
        })
      }
    }
  }
}