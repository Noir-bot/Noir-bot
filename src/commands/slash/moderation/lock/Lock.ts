import Colors from '@constants/Colors'
import Emojis from '@constants/Emojis'
import Logs from '@helpers/Logs'
import Reply from '@helpers/Reply'
import Client from '@structures/Client'
import ChatCommand from '@structures/commands/ChatCommand'
import { AccessType, CommandCategory, CommandType } from '@structures/commands/Command'
import { ApplicationCommandOptionType, ApplicationCommandType, ChannelType, ChatInputCommandInteraction, GuildChannel, channelMention, time } from 'discord.js'

export default class LockCommand extends ChatCommand {
  constructor(client: Client) {
    super(
      client,
      {
        permissions: ['ManageRoles', 'EmbedLinks'],
        category: CommandCategory.Moderation,
        access: AccessType.Moderation,
        type: CommandType.Public,
        status: true,
        rateLimit: 5
      },
      {
        name: 'lock',
        description: 'Lock channel',
        options: [
          {
            name: 'channel',
            description: 'Channel to lock',
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: false
          },
          {
            name: 'reason',
            description: 'Reason for locking the channel',
            type: ApplicationCommandOptionType.String,
            required: false
          }
        ],
        defaultMemberPermissions: ['ManageChannels'],
        type: ApplicationCommandType.ChatInput,
        dmPermission: false,
      }
    )
  }

  public async execute(client: Client, interaction: ChatInputCommandInteraction<'cached'>) {
    const channel = interaction.options.getChannel('channel') as GuildChannel ?? await client.channels.fetch(interaction.channelId)
    const reason = interaction.options.getString('reason')

    if (!channel) return
    if (channel.type != ChannelType.GuildText) return

    const lockData = client.channelLocks.get(channel.id)

    if (lockData) {
      Reply.reply({
        client,
        interaction,
        color: Colors.warning,
        author: 'Channel error',
        authorImage: client.user?.avatarURL(),
        description: `${channelMention(channel.id)} is already locked.`,
      })

      return
    }

    client.channelLocks.set(channel.id, true)

    channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
      SendMessages: false,
      AttachFiles: false,
      SendMessagesInThreads: false,
      CreatePublicThreads: false,
      CreatePrivateThreads: false,
      AddReactions: false,
    })

    Reply.reply({
      client,
      interaction,
      author: 'Channel lock',
      color: Colors.success,
      authorImage: client.user?.avatarURL(),
      description: `${channelMention(channel.id)} has been successfully locked.`,
    })

    const description = `${Emojis.channel} Channel:${channelMention(channel.id)}\n` +
      `${Emojis.user} Moderator: ${interaction.user.username} \`${interaction.user.id}\`\n` +
      `${reason ? `${Emojis.document} Reason: ${reason}\n` : ''}` +
      `${Emojis.lock} Locked at: ${time(new Date(), 'd')} (${time(new Date(), 'R')})`

    Logs.log({
      client,
      guild: interaction.guildId,
      description,
      author: 'Channel lock',
      color: Colors.logsGuild
    })
  }
}