import Colors from '@constants/Colors'
import Options from '@constants/Options'
import Reply from '@helpers/Reply'
import Client from '@structures/Client'
import ChatCommand from '@structures/commands/ChatCommand'
import { AccessType, CommandType } from '@structures/commands/Command'
import { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, MessageActionRowComponentBuilder } from 'discord.js'

export default class HelpCommand extends ChatCommand {
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
        name: 'help',
        description: 'Help command',
        defaultMemberPermissions: 'SendMessages',
        type: ApplicationCommandType.ChatInput,
        dmPermission: false,
      }
    )
  }

  public async execute(client: Client, interaction: ChatInputCommandInteraction | ButtonInteraction) {
    await HelpCommand.initialMessage(client, interaction)
  }

  public static async initialMessage(client: Client, interaction: ChatInputCommandInteraction | ButtonInteraction) {
    const button = new ButtonBuilder()
      .setURL(Options.docsLink)
      .setLabel('Noir docs')
      .setStyle(ButtonStyle.Link)

    const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(button)

    await Reply.reply({
      client,
      interaction: interaction,
      color: Colors.primary,
      author: 'Help command',
      authorImage: client.user?.avatarURL(),
      description: `Hey there, do not know where to start check out our [official guide](${Options.docsLink}/quick-guide) and quickly setup Noir for your server. If you got any question contact moderators in [the support server](${Options.guildInvite})`,
      components: [actionRow]
    })
  }
}
