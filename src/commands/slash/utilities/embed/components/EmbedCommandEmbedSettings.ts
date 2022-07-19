import { ActionRowBuilder, ButtonInteraction, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'
import NoirClient from '../../../../../structures/Client'
import EmbedCommand from '../EmbedCommand'
import EmbedCommandUtils from '../EmbedCommandUtils'

export default class EmbedCommandEmbedSettings {
  public static async request(client: NoirClient, interaction: ButtonInteraction, id: string): Promise<void> {
    const messageData = client.embeds.get(id)

    const colorInput = new TextInputBuilder()
      .setCustomId(EmbedCommandUtils.generateComponentId(id, 'color', 'input'))
      .setLabel('Embed color')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Green, gray, yellow, cyan, red, embed or color hex')
      .setValue(messageData?.data.embed.color ?? '')
      .setRequired(false)
      .setMaxLength(10)
      .setMinLength(1)
    const descriptionInput = new TextInputBuilder()
      .setCustomId(EmbedCommandUtils.generateComponentId(id, 'description', 'input'))
      .setLabel('Embed description')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Enter the description')
      .setValue(messageData?.data.embed.description ?? '')
      .setRequired(false)
      .setMaxLength(2000)
      .setMinLength(1)
    const imageInput = new TextInputBuilder()
      .setCustomId(EmbedCommandUtils.generateComponentId(id, 'image', 'input'))
      .setLabel('Embed image')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Image URL or server, user, client')
      .setValue(messageData?.data.embed.image ?? '')
      .setRequired(false)
      .setMaxLength(2000)
      .setMinLength(1)
    const thumbnailInput = new TextInputBuilder()
      .setCustomId(EmbedCommandUtils.generateComponentId(id, 'thumbnail', 'input'))
      .setLabel('Embed thumbnail')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Image URL or server, user, client')
      .setValue(messageData?.data.embed.thumbnail ?? '')
      .setRequired(false)
      .setMaxLength(2000)
      .setMinLength(1)
    const timestampInput = new TextInputBuilder()
      .setCustomId(EmbedCommandUtils.generateComponentId(id, 'timestamp', 'input'))
      .setLabel('Embed timestamp')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('True or false')
      .setValue(messageData?.data.embed.timestamp ? 'True' : 'False')
      .setRequired(false)
      .setMaxLength(5)
      .setMinLength(4)

    const actionRows = [
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(colorInput),
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(descriptionInput),
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(imageInput),
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(thumbnailInput),
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(timestampInput)
    ]

    const modal = new ModalBuilder()
      .setCustomId(EmbedCommandUtils.generateComponentId(id, 'embed', 'modal'))
      .setTitle('Embed settings')
      .addComponents(actionRows)

    await interaction.showModal(modal)
  }

  public static async response(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string): Promise<void> {
    const messageData = client.embeds.get(id)

    const colorInput = interaction.fields.getTextInputValue(EmbedCommandUtils.generateComponentId(id, 'color', 'input'))
    const descriptionInput = interaction.fields.getTextInputValue(EmbedCommandUtils.generateComponentId(id, 'description', 'input'))
    const imageInput = interaction.fields.getTextInputValue(EmbedCommandUtils.generateComponentId(id, 'image', 'input'))
    const thumbnailInput = interaction.fields.getTextInputValue(EmbedCommandUtils.generateComponentId(id, 'thumbnail', 'input'))
    const timestampInput = interaction.fields.getTextInputValue(EmbedCommandUtils.generateComponentId(id, 'timestamp', 'input'))

    if (colorInput) {
      messageData?.setEmbedColor(colorInput)
    }

    if (descriptionInput) {
      messageData?.setEmbedDescription(descriptionInput)
    }

    if (imageInput) {
      messageData?.setEmbedImage(imageInput)
    }

    if (thumbnailInput) {
      messageData?.setEmbedThumbnail(thumbnailInput)
    }

    if (timestampInput) {
      messageData?.setEmbedTimestamp(timestampInput)
    }

    await EmbedCommand.initialMessage(client, interaction, id)
  }
}