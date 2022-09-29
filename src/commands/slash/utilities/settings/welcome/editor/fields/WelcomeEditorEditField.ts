import { ActionRowBuilder, ButtonInteraction, MessageActionRowComponentBuilder, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, SelectMenuBuilder, SelectMenuInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'
import Colors from '../../../../../../../constants/Colors'
import { WelcomeMessageType } from '../../../../../../../constants/Options'
import NoirClient from '../../../../../../../structures/Client'
import SettingsUtils from '../../../SettingsUtils'
import WelcomeEditor from '../WelcomeEditor'

export default class WelcomeEditorEditField {
  public static async listRequest(client: NoirClient, interaction: ButtonInteraction | ModalMessageModalSubmitInteraction, id: string, type: WelcomeMessageType) {
    const { messageData } = await WelcomeEditor.getMessageType(client, id, type)

    if (!messageData) return

    const buttons = [
      SettingsUtils.generateBack('settings', id, `welcomeBack.welcomeEditor.${type}`)
    ]

    const selectMenu = new SelectMenuBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, `welcomeEditorEditField.${type}`, 'select'))
      .setPlaceholder('Choose field to edit')
      .setMaxValues(1)
      .setMinValues(1)
      .addOptions(messageData.embed.fields.map(field => {
        return {
          label: field.name,
          description: 'Select to edit',
          value: `${field.id}`
        }
      }))

    const selectMenuActionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(selectMenu)
    const buttonActionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(buttons)

    try {
      await client.reply.reply({
        interaction: interaction,
        author: 'Embed field editor',
        description: 'Edit embed fields.',
        color: Colors.primary,
        components: [selectMenuActionRow, buttonActionRow]
      })
    } catch {
      return
    }
  }

  public static async request(client: NoirClient, interaction: SelectMenuInteraction, id: string, type: WelcomeMessageType, fieldId: number) {
    const { messageData } = await WelcomeEditor.getMessageType(client, id, type)

    if (!messageData) return

    const index = messageData.embed.fields.findIndex(field => field.id == fieldId)

    const nameInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeFieldNameNew', 'input'))
      .setLabel('Embed field name')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter embed field name')
      .setValue(messageData.embed.fields[index].name ?? '')
      .setMaxLength(2000)
      .setMinLength(1)
      .setRequired(true)
    const valueInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeFieldValueNew', 'input'))
      .setLabel('Embed field value')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Enter embed field value')
      .setValue(messageData.embed.fields[index].value ?? '')
      .setMaxLength(2000)
      .setMinLength(1)
      .setRequired(true)
    const inlineInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeFieldInlineNew', 'input'))
      .setLabel('Embed field inline')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('True or false')
      .setValue(messageData.embed.fields[index].inline ? 'True' : 'False')
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

  public static async response(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string, type: WelcomeMessageType, index: number) {
    const { messageData } = await WelcomeEditor.getMessageType(client, id, type)

    if (!messageData) return

    const fieldNameInput = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'welcomeFieldNameNew', 'input'))
    const fieldValueInput = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'welcomeFieldValueNew', 'input'))
    const fieldInlineInput = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'welcomeFieldInlineNew', 'input'))

    if (fieldNameInput) {
      messageData.embed.fields[index].name = fieldNameInput
    }

    if (fieldValueInput) {
      messageData.embed.fields[index].value = fieldValueInput
    }

    if (fieldInlineInput) {
      messageData.embed.fields[index].inline = client.utils.formatBoolean(fieldInlineInput)
    }

    await this.listRequest(client, interaction, id, type)
  }
}