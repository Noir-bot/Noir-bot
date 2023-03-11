import SettingsUtils from '@commands/slash/utilities/settings/SettingsUtils'
import Colors from '@constants/Colors'
import Reply from '@helpers/Reply'
import Utils from '@helpers/Utils'
import Client from '@structures/Client'
import Save from '@structures/Save'
import WelcomeMessage, { WelcomeMessageType } from '@structures/welcome/WelcomeMessage'
import { ActionRowBuilder, ButtonInteraction, MessageActionRowComponentBuilder, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, StringSelectMenuBuilder, StringSelectMenuInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'

export default class WelcomeEditorEditField {
  public static async listRequest(client: Client, interaction: ButtonInteraction<'cached'> | ModalMessageModalSubmitInteraction<'cached'>, id: string, type: WelcomeMessageType) {
    const messageData = await WelcomeMessage.cache(client, id, type, false, true)

    const buttons = [
      SettingsUtils.generateBack('settings', id, `welcomeBack.welcomeEditor.${type}`)
    ]

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, `welcomeEditorEditField.${type}`, 'select'))
      .setPlaceholder('Choose field to edit')
      .setMaxValues(1)
      .setMinValues(1)
      .addOptions(messageData.fieldsId.map(id => {
        return {
          label: messageData.fieldsName[id],
          description: 'Select to edit',
          value: `${id}`
        }
      }))

    const selectMenuActionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(selectMenu)
    const buttonActionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(buttons)

    try {
      await Reply.reply({
        client,
        interaction: interaction,
        author: 'Embed field editor',
        description: 'Edit embed fields.',
        color: Colors.primary,
        components: [selectMenuActionRow, buttonActionRow]
      })
    } catch (err) {
      return console.log(err)
    }
  }

  public static async request(client: Client, interaction: StringSelectMenuInteraction<'cached'>, id: string, type: WelcomeMessageType, fieldId: number) {
    const messageData = await WelcomeMessage.cache(client, id, type, false, true)
    const index = messageData.fieldsId.findIndex(id => id == fieldId)

    const nameInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeFieldNameNew', 'input'))
      .setLabel('Embed field name')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter embed field name')
      .setValue(messageData.fieldsName[index] ?? '')
      .setMaxLength(2000)
      .setRequired(true)
    const valueInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeFieldValueNew', 'input'))
      .setLabel('Embed field value')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Enter embed field value')
      .setValue(messageData.fieldsValue[index] ?? '')
      .setMaxLength(2000)
      .setRequired(true)
    const inlineInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeFieldInlineNew', 'input'))
      .setLabel('Embed field inline')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('True or false')
      .setValue(messageData.fieldsInline[index] ? 'True' : 'False')
      .setMaxLength(5)
      .setMinLength(4)

    const actionRows = [
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(nameInput),
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(valueInput),
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(inlineInput)
    ]

    const modal = new ModalBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, `welcomeEditorEditField.${type}.${index}`, 'modal'))
      .setTitle('Embed field editor')
      .addComponents(actionRows)

    await interaction.showModal(modal)
  }

  public static async response(client: Client, interaction: ModalMessageModalSubmitInteraction<'cached'>, id: string, type: WelcomeMessageType, index: number) {
    const messageData = await WelcomeMessage.cache(client, id, type, false, true)
    const fieldNameInput = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'welcomeFieldNameNew', 'input'))
    const fieldValueInput = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'welcomeFieldValueNew', 'input'))
    const fieldInlineInput = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'welcomeFieldInlineNew', 'input'))
    const save = Save.cache(client, `${interaction.guildId}-welcome`)

    if (fieldNameInput) {
      messageData.fieldsName[index] = fieldNameInput
      save.count += 1
    }

    if (fieldValueInput) {
      messageData.fieldsValue[index] = fieldValueInput
      save.count += 1
    }

    if (fieldInlineInput) {
      messageData.fieldsInline[index] = Utils.formatBoolean(fieldInlineInput)
      save.count += 1
    }

    await this.listRequest(client, interaction, id, type)
  }
}