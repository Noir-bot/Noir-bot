import Colors from '@constants/Colors'
import Reply from '@helpers/Reply'
import Client from '@structures/Client'
import ChatCommand from '@structures/commands/ChatCommand'
import { AccessType, CommandType } from '@structures/commands/Command'
import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction } from 'discord.js'

export default class EmojiCommand extends ChatCommand {
  constructor(client: Client) {
    super(
      client,
      {
        permissions: 'EmbedLinks',
        access: AccessType.Public,
        type: CommandType.Public,
        rateLimit: 5,
        status: true
      },
      {
        name: 'emoji',
        description: 'Scale emoji',
        dmPermission: false,
        defaultMemberPermissions: 'ManageEmojisAndStickers',
        options: [
          {
            name: 'emoji',
            description: 'Emoji ID',
            required: true,
            type: ApplicationCommandOptionType.String
          }
        ],
        type: ApplicationCommandType.ChatInput
      }
    )
  }

  public async execute(client: Client, interaction: ChatInputCommandInteraction<'cached'>): Promise<void> {
    const emojiId = interaction.options.getString('emoji', true)

    try {
      const emoji = interaction.guild.emojis.cache.get(emojiId) ?? await interaction.guild.emojis.fetch(emojiId)

      if (!emoji) {
        Reply.reply({
          client,
          interaction,
          color: Colors.warning,
          author: 'Emoji error',
          description: 'Emoji not found.',
          ephemeral: true
        })
      }

      const imageURL = `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? 'gif' : 'png'}?size=4096`

      Reply.reply({
        client,
        interaction,
        content: imageURL,
      })
    } catch {
      Reply.reply({
        client,
        interaction,
        color: Colors.warning,
        author: 'Emoji error',
        description: 'Emoji not found.',
        ephemeral: true
      })
    }
  }
}