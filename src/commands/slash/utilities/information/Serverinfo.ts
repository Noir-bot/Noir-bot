import Colors from "@constants/Colors"
import Emojis from '@constants/Emojis'
import Reply from '@helpers/Reply'
import Client from "@structures/Client"
import Premium from '@structures/Premium'
import ChatCommand from "@structures/commands/ChatCommand"
import { AccessType, CommandType } from '@structures/commands/Command'
import Moderation from '@structures/moderation/Moderation'
import Welcome from '@structures/welcome/Welcome'
import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction, userMention } from 'discord.js'

export default class ServerinfoCommand extends ChatCommand {
  constructor(client: Client) {
    super(
      client,
      {
        permissions: ['EmbedLinks'],
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

    enum VerificationLevel {
      None = 0,
      Low = 1,
      Medium = 2,
      High = 3,
      Very_High = 4
    }

    const description = `${Emojis.user} members: \`${guild.memberCount}\`\n` +
      `${Emojis.bot} bots: \`${guild.members.cache.filter(m => m.user.bot).size}\`\n` +
      `${Emojis.channel} channels: \`${guild.channels.cache.size}\`\n` +
      `${Emojis.role} roles: \`${guild.roles.cache.size}\`\n`


    const fields = [
      {
        name: 'Information',
        value: `${Emojis.user} members: \`${guild.memberCount}\`\n` +
          `${Emojis.channel} channels: \`${guild.channels.cache.size}\`\n` +
          `${Emojis.role} roles: \`${guild.roles.cache.size}\`\n` +
          `${Emojis.bot} bots: \`${guild.members.cache.filter(m => m.user.bot).size}\``,
        inline: true
      },
      {
        name: 'Owner',
        value: Emojis.crown + ' ' + client.users.cache.get(guild.ownerId)?.tag ?? 'Unknown',
        inline: true
      },
      {
        name: 'Subscriptions',
        value: `Boost level \`${guild.premiumTier}\`\n` +
          `Boost count \`${guild.premiumSubscriptionCount}\`\n` +
          `Noir ${premiumData?.status() ? `\`premium\` ${Emojis.premium}` : '\`basic\`'}`,
        inline: true
      }
    ]


    Reply.reply({
      client: client,
      interaction: interaction,
      content: target ? `Information for ${userMention(target.id)}` : undefined,
      color: Colors.primary,
      ephemeral: ephemeralStatus,
      author: guild.name,
      authorImage: client.user?.avatarURL(),
      thumbnail: guild.iconURL() ?? undefined,
      image: guild.bannerURL() ?? undefined,
      description: guild.description ? guild.description : 'No server description',
      timestamp: guild.createdAt,
      footer: 'Created at',
      fields: fields
    })
  }
}
