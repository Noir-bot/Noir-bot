import { ActionRowBuilder, ButtonInteraction, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'
import { WelcomeMessageType } from '../../../../../../../constants/Options'
import NoirClient from '../../../../../../../structures/Client'
import SettingsUtils from '../../../SettingsUtils'
import WelcomeEditor from '../WelcomeEditor'

export default class WelcomeEditorAddField {
  public static async request(client: NoirClient, interaction: ButtonInteraction, id: string, type: WelcomeMessageType) {
    const { messageData } = await WelcomeEditor.getMessageType(client, id, type)

    if (!messageData) return

    const fieldNameInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeFieldName', 'input'))
      .setLabel('Field name')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter field name')
      .setRequired(true)
      .setMaxLength(2000)
      .setMinLength(1)
    const fieldValueInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeFieldValue', 'input'))
      .setLabel('Field value')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Enter field value')
      .setRequired(true)
      .setMaxLength(2000)
      .setMinLength(1)
    const fieldInlineInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeFieldInline', 'input'))
      .setLabel('Field inline')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('True or false')
      .setValue('False')
      .setRequired(false)
      .setMaxLength(5)
      .setMinLength(4)

    const actionRows = [
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(fieldNameInput),
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(fieldValueInput),
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(fieldInlineInput)
    ]

    const modal = new ModalBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, `welcomeEditorAddField.${type}`, 'modal'))
      .setTitle('Embed field builder')
      .addComponents(actionRows)

    await interaction.showModal(modal)
  }

  public static async response(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string, type: WelcomeMessageType) {
    const { messageData } = await WelcomeEditor.getMessageType(client, id, type)

    if (!messageData) return
    if (messageData.embed.fields.length > 5 && !client.utils.premiumStatus(interaction.guildId!)) return
    if (messageData.embed.fields.length >= 25) return

    const fieldNameInput = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'welcomeFieldName', 'input'))
    const fieldValueInput = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'welcomeFieldValue', 'input'))
    const fieldInlineInput = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'welcomeFieldInline', 'input'))

    messageData.embed.fields.push({
      id: messageData.embed.fields.length,
      name: fieldNameInput,
      value: fieldValueInput,
      inline: client.utils.formatBoolean(fieldInlineInput) ?? false
    })

    await WelcomeEditor.initialMessage(client, interaction, id, type)
  }
}