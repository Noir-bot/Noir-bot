import Colors from "@constants/Colors"
import Reply from '@helpers/Reply'
import Utils from '@helpers/Utils'
import Client from "@structures/Client"
import ChatCommand from "@structures/commands/ChatCommand"
import { AccessType, CommandType } from '@structures/commands/Command'
import Welcome from '@structures/welcome/Welcome'
import { ApplicationCommandOptionType, ApplicationCommandType, ChannelType, ChatInputCommandInteraction, channelMention, roleMention, userMention } from 'discord.js'
import Emojis from '../../../constants/Emojis'
import Premium from '../../../structures/Premium'
import Moderation from '../../../structures/moderation/Moderation'

export default class ServerinfoCommand extends ChatCommand {
  constructor(client: Client) {
    super(
      client,
      {
        permissions: ['SendMessages'],
        access: AccessType.Public,
        type: CommandType.Public,
        status: true
      },
      {
        name: 'serverinfo',
        description: 'Get information about the server',
        dmPermission: false,
        type: ApplicationCommandType.ChatInput,
        options: [
          {
            name: 'target',
            description: 'Mention user to get information for him',
            type: ApplicationCommandOptionType.User,
            required: false
          },
          {
            name: 'private',
            description: 'Send information in private message',
            type: ApplicationCommandOptionType.Boolean,
            required: false
          }
        ]
      }
    )
  }

  public async execute(client: Client, interaction: ChatInputCommandInteraction<'cached'>) {
    const ephemeralStatus = interaction.options.getBoolean('private') ?? false
    const target = interaction.options.getUser('target')

    await interaction.deferReply({ ephemeral: ephemeralStatus })

    const guild = await interaction.guild.fetch()
    const welcomeData = await Welcome.cache(client, guild.id)
    const moderationData = await Moderation.cache(client, guild.id)
    const premiumData = await Premium.cache(client, guild.id)

    const specialChannels = `${welcomeData.webhookChannel ? `Welcome channel ${channelMention(welcomeData.webhookChannel)}\n` : ''}` +
      `${moderationData.webhookChannel ? `Logs channel ${channelMention(moderationData.webhookChannel)}\n` : ''}` +
      `${guild.afkChannelId ? `AFK channel ${channelMention(guild.afkChannelId)}\n` : ''}` +
      `${guild.rulesChannelId ? `Rules channel ${channelMention(guild.rulesChannelId)}\n` : ''}`

    enum VerificationLevel {
      None = 0,
      Low = 1,
      Medium = 2,
      High = 3,
      Very_High = 4
    }

    const fields = [
      {
        name: 'Server owner',
        value: client.users.cache.get(guild.ownerId)?.username ?? 'Unknown',
        inline: true
      },
      {
        name: 'Server ID',
        value: guild.id,
        inline: true
      },
      {
        name: 'Verification level',
        value: Utils.capitalize(VerificationLevel[guild.verificationLevel], true),
        inline: true
      },
      {
        name: `Members (${guild.memberCount})`,
        value: `Bot \`${guild.members.cache.filter(member => member.user.bot).size}\``,
        inline: true
      },
      {
        name: `Channels (${guild.channels.cache.size - guild.channels.cache.filter(channel => channel.type == ChannelType.GuildCategory).size})`,
        value: `Categories \`${guild.channels.cache.filter(channel => channel.type == ChannelType.GuildCategory).size}\`\n` +
          `Forum \`${guild.channels.cache.filter(channel => channel.type == ChannelType.GuildForum).size}\`\n` +
          `Text \`${guild.channels.cache.filter(channel => channel.type == ChannelType.GuildText).size}\`\n` +
          `Voice \`${guild.channels.cache.filter(channel => channel.type == ChannelType.GuildVoice).size}\`\n`,
        inline: true
      },
      {
        name: `Roles (${guild.roles.cache.size})`,
        value: `Welcome roles ${welcomeData.roles?.map(role => roleMention(role))}`,
        inline: true
      },
      {
        name: 'Premium tier',
        value: `Boost level \`${guild.premiumTier}\`\n` +
          `Boost count \`${guild.premiumSubscriptionCount}\`\n` +
          `Noir premium ${premiumData?.status() ? Emojis.enable : Emojis.disable}`,
        inline: true
      }
    ]

    if (specialChannels) {
      fields.push({
        name: 'Special channels',
        value: specialChannels,
        inline: true
      })
    }

    Reply.reply({
      client: client,
      interaction: interaction,
      content: target ? `Information for ${userMention(target.id)}` : undefined,
      color: Colors.primary,
      ephemeral: ephemeralStatus,
      author: 'Server info',
      authorImage: client.user?.avatarURL(),
      thumbnail: guild.iconURL() ?? undefined,
      image: guild.bannerURL() ?? undefined,
      description: guild.description ?? 'No server description',
      timestamp: guild.createdAt,
      footer: 'Created at',
      footerImage: guild.iconURL() ?? undefined,
      fields: fields
    })
  }
}
