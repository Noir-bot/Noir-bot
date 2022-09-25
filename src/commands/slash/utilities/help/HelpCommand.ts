import { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, MessageActionRowComponentBuilder } from 'discord.js'
import Colors from '../../../../constants/Colors'
import Options from '../../../../constants/Options'
import NoirClient from '../../../../structures/Client'
import ChatCommand from '../../../../structures/commands/ChatCommand'

export default class HelpCommand extends ChatCommand {
  constructor(client: NoirClient,) {
    super(
      client,
      {
        permissions: ['SendMessages', 'EmbedLinks'],
        access: 'public',
        type: 'public',
        status: true
      },
      {
        name: 'help',
        description: 'Help command',
        nameLocalizations: { 'ru': 'помощ' },
        descriptionLocalizations: { 'ru': 'Команда помощи' },
        defaultMemberPermissions: 'SendMessages',
        type: ApplicationCommandType.ChatInput,
        dmPermission: false,
      }
    )
  }

  public async execute(client: NoirClient, interaction: ChatInputCommandInteraction | ButtonInteraction): Promise<void> {
    await HelpCommand.initialMessage(client, interaction)
  }

  public static async initialMessage(client: NoirClient, interaction: ChatInputCommandInteraction | ButtonInteraction): Promise<void> {
    const button = new ButtonBuilder()
      .setCustomId('help-faq')
      .setLabel('F.A.Q.')
      .setStyle(ButtonStyle.Secondary)
    const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(button)

    await client.reply.reply({
      interaction: interaction,
      color: Colors.primary,
      author: 'Help command',
      authorImage: Options.clientAvatar,
      description: `Hey there, if you have any problems or questions contact our support team. Be sure to join [support server](${Options.guildInvite})`,
      components: [actionRow]
    })
  }

  public static async faqMessage(client: NoirClient, interaction: ButtonInteraction): Promise<void> {
    const button = new ButtonBuilder()
      .setCustomId('help-back')
      .setLabel('Back')
      .setStyle(ButtonStyle.Secondary)
    const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(button)

    const fields = [
      {
        name: 'How to contribute ?',
        value: `Noir bot is open source, checkout Noir's github page [here](${Options.github})`,
        inline: false
      },
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

    await client.reply.reply({
      interaction: interaction,
      color: Colors.primary,
      author: 'Frequently asked questions',
      authorImage: Options.clientAvatar,
      components: [actionRow],
      fields: fields,
      fetch: true
    })
  }
}