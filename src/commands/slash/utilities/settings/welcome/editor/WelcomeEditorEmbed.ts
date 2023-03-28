import SettingsUtils from '@commands/slash/utilities/settings/SettingsUtils'
import WelcomeEditor from '@commands/slash/utilities/settings/welcome/editor/WelcomeEditor'
import Utils from '@helpers/Utils'
import Client from '@structures/Client'
import Save from '@structures/Save'
import WelcomeMessage, { WelcomeMessageType } from '@structures/welcome/WelcomeMessage'
import { ActionRowBuilder, ButtonInteraction, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'

export default class WelcomeEditorEmbed {
  public static async request(client: Client, interaction: ButtonInteraction<'cached'>, id: string, type: WelcomeMessageType) {
    const messageData = await WelcomeMessage.cache(client, id, type, false, true)

    const colorInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeEmbedColor', 'input'))
      .setLabel('Embed color')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter color hex or color name')
      .setValue(messageData.rawColor ?? '')
      .setRequired(false)
      .setMaxLength(10)
    const descriptionInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeEmbedDescription', 'input'))
      .setLabel('Embed description')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Enter the description')
      .setValue(messageData.description ?? '')
      .setRequired(false)
      .setMaxLength(2000)
    const imageInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeEmbedImage', 'input'))
      .setLabel('Embed image')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter image URL or server, user, client')
      .setValue(messageData.rawImage ?? '')
      .setRequired(false)
      .setMaxLength(2000)
    const thumbnailInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeEmbedThumbnail', 'input'))
      .setLabel('Embed thumbnail')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter image URL or server, user, client')
      .setValue(messageData.rawThumbnail ?? '')
      .setRequired(false)
      .setMaxLength(2000)
    const timestampInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeEmbedTimestamp', 'input'))
      .setLabel('Embed timestamp')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('True or false')
      .setValue(messageData.timestamp ? 'True' : 'False')
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

  public static async response(client: Client, interaction: ModalMessageModalSubmitInteraction<'cached'>, id: string, type: WelcomeMessageType) {
    const messageData = await WelcomeMessage.cache(client, id, type, false, true)

    const colorInput = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'welcomeEmbedColor', 'input'))
    const descriptionInput = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'welcomeEmbedDescription', 'input'))
    const imageInput = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'welcomeEmbedImage', 'input'))
    const thumbnailInput = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'welcomeEmbedThumbnail', 'input'))
    const timestampInput = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'welcomeEmbedTimestamp', 'input'))

    const saves = Save.cache(client, `${interaction.guildId}-welcome`)

    if (colorInput) {
      messageData.rawColor = WelcomeMessage.formatRemove(colorInput)
      messageData.color = WelcomeMessage.formatColor(colorInput)
      saves.count += 1
    }

    if (descriptionInput) {
      messageData.description = WelcomeMessage.formatRemove(descriptionInput)
      saves.count += 1
    }

    if (imageInput) {
      const formatted = WelcomeMessage.formatImage(imageInput, { guild: interaction.guild.iconURL(), client: client.user?.avatarURL(), user: client.user?.avatarURL() })

      messageData.image = formatted == messageData.rawImage ? undefined : formatted
      messageData.rawImage = WelcomeMessage.formatRemove(imageInput)
      saves.count += 1
    }

    if (thumbnailInput) {
      const formatted = WelcomeMessage.formatImage(thumbnailInput, { guild: interaction.guild.iconURL(), client: client.user?.avatarURL(), user: client.user?.avatarURL() })

      messageData.thumbnail = formatted == messageData.rawThumbnail ? undefined : formatted
      messageData.rawThumbnail = WelcomeMessage.formatRemove(thumbnailInput)
      saves.count += 1
    }

    if (timestampInput) {
      messageData.timestamp = Utils.formatBoolean(timestampInput)
    }

    await WelcomeEditor.initialMessage(client, interaction, id, type)
  }
}