import SettingsUtils from '@commands/slash/utilities/settings/SettingsUtils'
import WelcomeEditor from '@commands/slash/utilities/settings/welcome/editor/WelcomeEditor'
import Client from '@structures/Client'
import Premium from '@structures/Premium'
import Save from '@structures/Save'
import WelcomeMessage, { WelcomeMessageType } from '@structures/welcome/WelcomeMessage'
import { ActionRowBuilder, ButtonInteraction, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'

export default class WelcomeEditorAddField {
  public static async request(client: Client, interaction: ButtonInteraction<'cached'>, id: string, type: WelcomeMessageType) {
    const messageData = await WelcomeMessage.cache(client, id, type, false, true)

    if (!messageData) return

    const fieldNameInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeFieldName', 'input'))
      .setLabel('Field name')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter field name')
      .setRequired(true)
      .setMaxLength(2000)
    const fieldValueInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeFieldValue', 'input'))
      .setLabel('Field value')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Enter field value')
      .setRequired(true)
      .setMaxLength(2000)
    const fieldInlineInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeFieldInline', 'input'))
      .setLabel('Field inline')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('True or false')
      .setValue('False')
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

  public static async response(client: Client, interaction: ModalMessageModalSubmitInteraction<'cached'>, id: string, type: WelcomeMessageType) {
    const messageData = await WelcomeMessage.cache(client, id, type, false, true)
    const premiumData = await Premium.cache(client, id)
    const save = Save.cache(client, `${interaction.guildId}-welcome`)

    if (!messageData) return
    if (messageData.fieldsId.length > 5 && !premiumData?.status()) return
    if (messageData.fieldsId.length >= 25) return

    const fieldNameInput = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'welcomeFieldName', 'input'))
    const fieldValueInput = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'welcomeFieldValue', 'input'))
    const fieldInlineInput = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'welcomeFieldInline', 'input')).trim().toLowerCase()

    messageData.fieldsId.push(messageData.fieldsId.length)
    messageData.fieldsName.push(fieldNameInput)
    messageData.fieldsValue.push(fieldValueInput)
    messageData.fieldsInline.push(fieldInlineInput == 'true' ? true : false)
    save.count += 1

    await WelcomeEditor.initialMessage(client, interaction, id, type)
  }
}