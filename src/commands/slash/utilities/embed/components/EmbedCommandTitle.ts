import { ActionRowBuilder, ButtonInteraction, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'
import NoirClient from '../../../../../structures/Client'
import EmbedCommand from '../EmbedCommand'
import EmbedCommandUtils from '../EmbedCommandUtils'

export class EmbedCommandTitle {
  public static async request(client: NoirClient, interaction: ButtonInteraction, id: string): Promise<void> {
    const messageData = client.embedConstructors.get(id)

    const titleInput = new TextInputBuilder()
      .setCustomId(EmbedCommandUtils.generateComponentId(id, 'title', 'input'))
      .setLabel('Embed title')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter embed title')
      .setValue(messageData?.data.embed.title ?? '')
      .setMaxLength(2000)
      .setMinLength(1)
      .setRequired(true)
    const URLInput = new TextInputBuilder()
      .setCustomId(EmbedCommandUtils.generateComponentId(id, 'url', 'input'))
      .setLabel('Embed URL')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter embed URL')
      .setValue(messageData?.data.embed.url ?? '')
      .setMaxLength(2000)
      .setMinLength(1)

    const actionRows = [
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(titleInput),
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(URLInput)
    ]

    const modal = new ModalBuilder()
      .setCustomId(EmbedCommandUtils.generateComponentId(id, 'title', 'modal'))
      .setTitle('Embed title builder')
      .addComponents(actionRows)

    await interaction.showModal(modal)
  }

  public static async response(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string): Promise<void> {
    const messageData = client.embedConstructors.get(id)

    const titleInput = interaction.fields.getTextInputValue(EmbedCommandUtils.generateComponentId(id, 'title', 'input'))
    const URLInput = interaction.fields.getTextInputValue(EmbedCommandUtils.generateComponentId(id, 'url', 'modal'))

    messageData?.setEmbedTitle(titleInput)

    if (URLInput) {
      messageData?.setEmbedURL(URLInput)
    }

    await EmbedCommand.initialMessage(client, interaction, id)
  }
}