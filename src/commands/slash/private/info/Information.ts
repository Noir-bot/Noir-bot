import Emojis from '@constants/Emojis'
import Options from '@constants/Options'
import Reply from '@helpers/Reply'
import Client from '@structures/Client'
import ChatCommand from '@structures/commands/ChatCommand'
import { AccessType, CommandType } from '@structures/commands/Command'
import { ApplicationCommandType, ChatInputCommandInteraction, channelMention } from 'discord.js'

export default class RulesCommand extends ChatCommand {
  constructor(client: Client) {
    super(
      client,
      {
        permissions: [],
        access: AccessType.Private,
        type: CommandType.Private,
        status: true
      },
      {
        name: 'info',
        description: 'Send server information',
        type: ApplicationCommandType.ChatInput,
        defaultMemberPermissions: 'Administrator',
        dmPermission: false
      }
    )
  }

  public execute(client: Client, interaction: ChatInputCommandInteraction<'cached'>) {
    Reply.sendMessage({
      client,
      channel: interaction.channelId,
      author: interaction.guild.name,
      authorImage: interaction.guild.iconURL() ?? undefined,
      description: `Welcome to Noir's official Discord server.`,
      fields: [
        {
          name: `${Emojis.channel} Support`,
          value: `Contact our ${channelMention(Options.supportId)} channel. Report bugs, get answer to your questions and even suggest your own ideas. `,
          inline: false,
        },
        {
          name: `${Emojis.book} Docs`,
          value: `Want to learn more about the features and how to use them, check out our [docs here](${Options.docsLink}).`,
          inline: false,
        },
        {
          name: `${Emojis.premium} Noir Premium`,
          value: `Get bracing features for your server, exclusive premium role and support our team to make even more epic stuff.\n${Emojis.point} [Patreon](${Options.patreonLink})\n${Emojis.point} [Buy me a coffee](${Options.buyMeACoffeeLink})`,
          inline: false,
        }
      ]
    })

    Reply.reply({
      client,
      interaction,
      content: 'Successfully sent the rules',
      update: false
    })
  }
}