import { ActionRowBuilder, ButtonInteraction, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'
import NoirClient from '../../../../../structures/Client'
import EmbedCommand from '../EmbedCommand'
import EmbedCommandUtils from '../EmbedCommandUtils'

export default class EmbedCommandMessage {
  public static async request(client: NoirClient, interaction: ButtonInteraction, id: string): Promise<void> {
    const messageData = client.embedConstructors.get(id)

    const messageInput = new TextInputBuilder()
      .setCustomId(EmbedCommandUtils.generateComponentId(id, 'message', 'input'))
      .setLabel('Message content')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Enter message content')
      .setValue(messageData?.data.message ?? '')
      .setMaxLength(2000)
      .setMinLength(1)
      .setRequired(true)

    const actionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>()
      .addComponents(messageInput)

    const modal = new ModalBuilder()
      .setCustomId(EmbedCommandUtils.generateComponentId(id, 'message', 'modal'))
      .setTitle('Message content builder')
      .addComponents(actionRow)

    await interaction.showModal(modal)
  }

  public static async response(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string): Promise<void> {
    const messageData = client.embedConstructors.get(id)
    const messageInput = interaction.fields.getTextInputValue(EmbedCommandUtils.generateComponentId(id, 'message', 'input'))

    messageData?.setMessage(messageInput)

    await EmbedCommand.initialMessage(client, interaction, id)
  }
}