import { ActionRowBuilder, ApplicationCommandType, ChatInputCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js'
import NoirClient from '../../../libs/structures/Client'
import NoirChatCommand from '../../../libs/structures/command/ChatCommand'

export default class AnnouncementCommand extends NoirChatCommand {
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
        name: 'announcement',
        description: 'Make an announcement',
        type: ApplicationCommandType.ChatInput
      }
    )
  }

  public async execute(client: NoirClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const titleInput = new TextInputBuilder()
      .setCustomId('announcement-title')
      .setStyle(TextInputStyle.Short)
      .setLabel('Title')
      .setRequired(true)
    const bodyInput = new TextInputBuilder()
      .setCustomId('announcement-body')
      .setStyle(TextInputStyle.Paragraph)
      .setLabel('Body')
      .setRequired(true)
    const titleActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents([titleInput])
    const bodyActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents([bodyInput])

    const modal = new ModalBuilder()
      .setTitle('Announcement')
      .setCustomId('announcement')
      .addComponents([titleActionRow, bodyActionRow])

    await interaction.showModal(modal)
  }
}