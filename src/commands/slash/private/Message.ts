import { ActionRowBuilder, ApplicationCommandType, CacheType, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'
import { colors } from '../../../libs/config/design'
import NoirClient from '../../../libs/structures/Client'
import NoirChatCommand from '../../../libs/structures/command/ChatCommand'

export default class MessageCommand extends NoirChatCommand {
  constructor(client: NoirClient) {
    super(
      client,
      {
        permissions: ['SendMessages', 'EmbedLinks'],
        category: 'information',
        access: 'private',
        type: 'private',
        status: true
      },
      {
        name: 'message',
        description: 'Send message from bot',
        type: ApplicationCommandType.ChatInput
      }
    )
  }

  public async execute(client: NoirClient, interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
    const contentInput = new TextInputBuilder()
      .setStyle(TextInputStyle.Paragraph)
      .setCustomId('message-content')
      .setLabel('Content')
      .setRequired(false)
    const colorInput = new TextInputBuilder()
      .setStyle(TextInputStyle.Short)
      .setCustomId('message-color')
      .setLabel('Color')
      .setPlaceholder('primary, secondary, tertiary, success, warning, embed')
      .setRequired(false)
    const authorInput = new TextInputBuilder()
      .setStyle(TextInputStyle.Short)
      .setCustomId('message-author')
      .setLabel('Author title')
      .setRequired(false)
    const descriptionInput = new TextInputBuilder()
      .setStyle(TextInputStyle.Paragraph)
      .setCustomId('message-description')
      .setLabel('Description')
      .setRequired(false)
    const footerInput = new TextInputBuilder()
      .setStyle(TextInputStyle.Short)
      .setCustomId('message-footer')
      .setLabel('Footer text')
      .setRequired(false)

    const contentActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents([contentInput])
    const colorActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents([colorInput])
    const authorActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents([authorInput])
    const descriptionActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents([descriptionInput])
    const footerActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents([footerInput])

    const modal = new ModalBuilder()
      .setTitle('Message builder')
      .setCustomId('message')
      .addComponents([contentActionRow, colorActionRow, authorActionRow, descriptionActionRow, footerActionRow])

    await interaction.showModal(modal)
  }

  public async response(client: NoirClient, interaction: ModalSubmitInteraction): Promise<void> {
    const content = interaction.fields.getTextInputValue('message-content') || undefined
    const author = interaction.fields.getTextInputValue('message-author') || undefined
    const description = interaction.fields.getTextInputValue('message-description') || undefined
    const footer = interaction.fields.getTextInputValue('message-footer') || undefined
    let rawColor = interaction.fields.getTextInputValue('message-color').toLowerCase() || undefined
    let color: ColorResolvable = colors.Secondary

    if (rawColor) {
      if (rawColor == 'primary') color = colors.Primary
      else if (rawColor == 'secondary') color = colors.Secondary
      else if (rawColor == 'tertiary') color = colors.Tertiary
      else if (rawColor == 'success') color = colors.Success
      else if (rawColor == 'warning') color = colors.Warning
      else if (rawColor == 'embed') color = colors.Embed
      else rawColor = undefined
    }

    await client.noirReply.reply({
      interaction: interaction,
      color: colors.Success,
      author: 'Message success',
      description: 'Message successfully sent'
    })

    const embed = new EmbedBuilder()
      .setColor(color)

    if (author) embed.setAuthor({ name: author })
    if (footer) embed.setFooter({ text: footer })
    if (description) embed.setDescription(description)

    await interaction.channel?.send({
      content: content,
      embeds: embed.data.description !== undefined || embed.data.author !== undefined ? [embed] : undefined,
    }).catch(() => {
      throw new Error('Empty message')
    })
  }
}