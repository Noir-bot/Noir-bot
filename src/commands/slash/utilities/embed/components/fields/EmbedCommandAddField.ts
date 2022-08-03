import { ActionRowBuilder, ButtonInteraction, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'
import NoirClient from '../../../../../../structures/Client'
import EmbedCommand from '../../EmbedCommand'
import EmbedCommandUtils from '../../EmbedCommandUtils'

export default class EmbedCommandAddField {
  public static async request(client: NoirClient, interaction: ButtonInteraction, id: string): Promise<void> {
    const nameInput = new TextInputBuilder()
      .setCustomId(EmbedCommandUtils.generateComponentId(id, 'fieldName', 'input'))
      .setLabel('Embed field name')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter embed field name')
      .setMaxLength(2000)
      .setMinLength(1)
      .setRequired(true)
    const valueInput = new TextInputBuilder()
      .setCustomId(EmbedCommandUtils.generateComponentId(id, 'fieldValue', 'input'))
      .setLabel('Embed field value')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Enter embed field value')
      .setMaxLength(2000)
      .setMinLength(1)
      .setRequired(true)
    const inlineInput = new TextInputBuilder()
      .setCustomId(EmbedCommandUtils.generateComponentId(id, 'fieldInline', 'input'))
      .setLabel('Embed field inline')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('True or false')
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
      .setCustomId(EmbedCommandUtils.generateComponentId(id, 'fieldAdd', 'modal'))
      .setTitle('Embed field builder')
      .addComponents(actionRows)

    await interaction.showModal(modal)
  }

  public static async response(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string): Promise<void> {
    const name = interaction.fields.getTextInputValue(EmbedCommandUtils.generateComponentId(id, 'fieldName', 'input'))
    const value = interaction.fields.getTextInputValue(EmbedCommandUtils.generateComponentId(id, 'fieldValue', 'input'))
    const inline = interaction.fields.getTextInputValue(EmbedCommandUtils.generateComponentId(id, 'fieldInline', 'input')).toLowerCase()

    if (name && value && inline || name && value) {
      const messageData = client.embedConstructors.get(id)
      const fieldId = messageData?.data.embed.fields.size ? messageData.data.embed.fields.size + 1 : 1
      messageData?.addEmbedField({ name: name, value: value, inline: inline == 'true' ? true : false, id: fieldId })
    }

    await EmbedCommand.initialMessage(client, interaction, id)
  }
}