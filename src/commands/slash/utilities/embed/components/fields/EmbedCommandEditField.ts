import { ActionRowBuilder, ButtonInteraction, MessageActionRowComponentBuilder, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, SelectMenuBuilder, SelectMenuInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'
import Colors from '../../../../../../constants/Colors'
import NoirClient from '../../../../../../structures/Client'
import EmbedCommand from '../../EmbedCommand'
import EmbedCommandComponents from '../../EmbedCommandComponents'
import EmbedCommandUtils from '../../EmbedCommandUtils'
export default class EmbedCommandEditField {
  public static async listRequest(client: NoirClient, interaction: ButtonInteraction, id: string): Promise<void> {
    const messageData = client.embeds.get(id)

    if (!messageData?.data.embed.fields?.size) return

    const selectMenu = new SelectMenuBuilder()
      .setCustomId(EmbedCommandUtils.generateComponentId(id, 'fieldEditList', 'select'))
      .setPlaceholder('Choose field to edit')
      .setMaxValues(1)
      .setMinValues(1)
      .addOptions(messageData.data.embed.fields.map(field => {
        return {
          label: field.name,
          description: 'Select to edit',
          value: `${field.id}`
        }
      }))

    const selectMenuActionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(selectMenu)
    const buttonActionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(EmbedCommandComponents.backButton(id))

    try {
      await client.reply.reply({
        interaction: interaction,
        author: 'Embed fields edit',
        description: 'Select field to edit',
        color: Colors.primary,
        components: [selectMenuActionRow, buttonActionRow]
      })
    } catch {
      return
    }
  }

  public static async request(client: NoirClient, interaction: SelectMenuInteraction, id: string, fieldId: number): Promise<void> {
    const message = client.embeds.get(id)

    const nameInput = new TextInputBuilder()
      .setCustomId(EmbedCommandUtils.generateComponentId(id, 'fieldName', 'input'))
      .setLabel('Embed field name')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter embed field name')
      .setValue(message?.data.embed.fields?.get(fieldId)?.name ?? '')
      .setMaxLength(2000)
      .setMinLength(1)
      .setRequired(true)
    const valueInput = new TextInputBuilder()
      .setCustomId(EmbedCommandUtils.generateComponentId(id, 'fieldValue', 'input'))
      .setLabel('Embed field value')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Enter embed field value')
      .setValue(message?.data.embed.fields?.get(fieldId)?.value ?? '')
      .setMaxLength(2000)
      .setMinLength(1)
      .setRequired(true)
    const inlineInput = new TextInputBuilder()
      .setCustomId(EmbedCommandUtils.generateComponentId(id, 'fieldInline', 'input'))
      .setLabel('Embed field inline')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('True or false')
      .setValue(message?.data.embed.fields?.get(fieldId)?.inline ? 'True' : 'False')
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
      .setCustomId(EmbedCommandUtils.generateComponentId(id, 'fieldEdit', 'modal') + `-${fieldId}`)
      .setTitle('Embed field editor')
      .addComponents(actionRows)

    await interaction.showModal(modal)
  }

  public static async response(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string, fieldId: number): Promise<void> {
    const name = interaction.fields.getTextInputValue(EmbedCommandUtils.generateComponentId(id, 'fieldName', 'input'))
    const value = interaction.fields.getTextInputValue(EmbedCommandUtils.generateComponentId(id, 'fieldValue', 'input'))
    const inline = interaction.fields.getTextInputValue(EmbedCommandUtils.generateComponentId(id, 'fieldInline', 'input')).toLowerCase()

    if (name && value && inline == 'true' || name && value) {
      client.embeds.get(id)?.editEmbedField({ name: name, value: value, inline: inline == 'true' ? true : false, id: fieldId })
    }

    await EmbedCommand.initialMessage(client, interaction, id)
  }
}