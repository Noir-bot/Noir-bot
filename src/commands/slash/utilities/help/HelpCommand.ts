import Colors from '@constants/Colors'
import Options from '@constants/Options'
import Reply from '@helpers/Reply'
import Client from '@structures/Client'
import ChatCommand from '@structures/commands/ChatCommand'
import { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, MessageActionRowComponentBuilder } from 'discord.js'
import {AccessType,CommandType} from '@structures/commands/Command'

export default class HelpCommand extends ChatCommand {
  constructor(client: Client) {
    super(
      client,
      {
        permissions: ['SendMessages', 'EmbedLinks'],
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

  public async execute(client: Client, interaction: ChatInputCommandInteraction | ButtonInteraction): Promise<void> {
    await HelpCommand.initialMessage(client, interaction)
  }

  public static async initialMessage(client: Client, interaction: ChatInputCommandInteraction | ButtonInteraction): Promise<void> {
    const button = new ButtonBuilder()
      .setCustomId('help-faq')
      .setLabel('F.A.Q.')
      .setStyle(ButtonStyle.Secondary)
    const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(button)

    await Reply.reply({
      client,
      interaction: interaction,
      color: Colors.primary,
      author: 'Help command',
      authorImage: client.user?.avatarURL(),
      description: `Hey there, if you have any problems or questions contact our support team. Be sure to join [support server](${Options.guildInvite})`,
      components: [actionRow]
    })
  }

  public static async faqMessage(client: Client, interaction: ButtonInteraction): Promise<void> {
    const button = new ButtonBuilder()
      .setCustomId('help-back')
      .setLabel('Back')
      .setStyle(ButtonStyle.Secondary)
    const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(button)

    const fields = [
      {
        name: 'How to become support team member ?',
        value: `Be active in [support server](${Options.guildInvite}) and help others to become support team member`,
        inline: false
      },
      {
        name: 'How to setup Noir for my server ?',
        value: 'Very simple, use `settings` command and get advanced interface with all features, use buttons to navigate and setup as you want',
        inline: false
      }
    ]

    await Reply.reply({
      client,
      interaction: interaction,
      color: Colors.primary,
      author: 'Frequently asked questions',
      authorImage: client.user?.avatarURL(),
      components: [actionRow],
      fields: fields,
      fetch: true
    })
  }
}
