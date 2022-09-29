import { ActionRowBuilder, ButtonInteraction, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'
import { WelcomeMessageType } from '../../../../../../constants/Options'
import NoirClient from '../../../../../../structures/Client'
import SettingsUtils from '../../SettingsUtils'
import WelcomeEditor from './WelcomeEditor'

export default class WelcomeEditorEmbed {
  public static async request(client: NoirClient, interaction: ButtonInteraction, id: string, type: WelcomeMessageType) {
    const { messageData } = await WelcomeEditor.getMessageType(client, id, type)

    if (!messageData) return

    const colorInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeEmbedColor', 'input'))
      .setLabel('Embed color')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter green, gray, yellow, blue, red, embed or color hex')
      .setValue(messageData.embed.rawColor ?? '')
      .setRequired(false)
      .setMaxLength(10)
      .setMinLength(1)
    const descriptionInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeEmbedDescription', 'input'))
      .setLabel('Embed description')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Enter the description')
      .setValue(messageData.embed.description ?? '')
      .setRequired(false)
      .setMaxLength(2000)
      .setMinLength(1)
    const imageInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeEmbedImage', 'input'))
      .setLabel('Embed image')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter image URL or server, user, client')
      .setValue(messageData.embed.rawImage ?? '')
      .setRequired(false)
      .setMaxLength(2000)
      .setMinLength(1)
    const thumbnailInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeEmbedThumbnail', 'input'))
      .setLabel('Embed thumbnail')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter image URL or server, user, client')
      .setValue(messageData.embed.rawThumbnail ?? '')
      .setRequired(false)
      .setMaxLength(2000)
      .setMinLength(1)
    const timestampInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeEmbedTimestamp', 'input'))
      .setLabel('Embed timestamp')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('True or false')
      .setValue(messageData.embed.timestamp ? 'True' : 'False')
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
      .setCustomId(SettingsUtils.generateId('settings', id, `welcomeEditorEmbed.${type}`, 'modal'))
      .setTitle('Embed settings')
      .addComponents(actionRows)

    await interaction.showModal(modal)
  }

  public static async response(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string, type: WelcomeMessageType) {
    const { messageData } = await WelcomeEditor.getMessageType(client, id, type)

    if (!messageData) return

    const colorInput = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'welcomeEmbedColor', 'input'))
    const descriptionInput = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'welcomeEmbedDescription', 'input'))
    const imageInput = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'welcomeEmbedImage', 'input'))
    const thumbnailInput = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'welcomeEmbedThumbnail', 'input'))
    const timestampInput = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'welcomeEmbedTimestamp', 'input'))

    console.log(colorInput)

    if (colorInput) {
      messageData.embed.rawColor = client.utils.removeFormatValue(colorInput)
      messageData.embed.color = client.utils.formatColor(colorInput)
    }

    if (descriptionInput) {
      messageData.embed.description = client.utils.removeFormatValue(descriptionInput)
    }

    if (imageInput) {
      messageData.embed.image = client.utils.removeFormatValue(SettingsUtils.formatImage(client, interaction, imageInput))
      messageData.embed.rawImage = client.utils.removeFormatValue(imageInput)
    }

    if (thumbnailInput) {
      messageData.embed.thumbnail = client.utils.removeFormatValue(SettingsUtils.formatImage(client, interaction, thumbnailInput))
      messageData.embed.rawThumbnail = client.utils.removeFormatValue(thumbnailInput)
    }

    if (timestampInput) {
      messageData.embed.timestamp = client.utils.formatBoolean(timestampInput)
    }

    await WelcomeEditor.initialMessage(client, interaction, id, type)
  }
}