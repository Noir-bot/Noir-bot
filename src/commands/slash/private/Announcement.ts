import { ActionRowBuilder, ApplicationCommandType, ChatInputCommandInteraction, EmbedBuilder, ModalBuilder, ModalSubmitInteraction, TextChannel, TextInputBuilder, TextInputStyle } from 'discord.js'
import { colors } from '../../../libs/config/design'
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

  public async response(client: NoirClient, interaction: ModalSubmitInteraction) {
    const title = interaction.fields.getTextInputValue('announcement-title')
    const body = interaction.fields.getTextInputValue('announcement-body')
    const avatar = interaction.user?.avatarURL() ? interaction.user.avatarURL() : undefined
    const channel = (client.channels.cache.get(process.env.ANNOUNCEMENT_CHANNEL!) ?? await client.channels.fetch(process.env.ANNOUNCEMENT_CHANNEL!)) as TextChannel

    const embed = new EmbedBuilder()
      .setAuthor({ name: title, iconURL: avatar == null ? undefined : avatar })
      .setDescription(body)
      .setColor(colors.Tertiary)

    await channel.send({ embeds: [embed] })
    await client.noirReply.reply({
      interaction: interaction,
      color: colors.Success,
      author: 'Successfully done',
      description: 'Announcement was successfully sent'
    })
  }
}