import { ActionRowBuilder, ButtonInteraction, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'
import NoirClient from '../../../../../structures/Client'
import EmbedCommand from '../EmbedCommand'
import EmbedCommandUtils from '../EmbedCommandUtils'

export default class EmbedCommandFooter {
  public static async request(client: NoirClient, interaction: ButtonInteraction, id: string): Promise<void> {
    const messageData = client.embedConstructors.get(id)

    const footerInput = new TextInputBuilder()
      .setCustomId(EmbedCommandUtils.generateComponentId(id, 'footer', 'input'))
      .setLabel('Embed footer text')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter embed footer text')
      .setValue(messageData?.data.embed.footer ?? '')
      .setMaxLength(2000)
      .setMinLength(1)
      .setRequired(true)
    const footerImageInput = new TextInputBuilder()
      .setCustomId(EmbedCommandUtils.generateComponentId(id, 'footerImage', 'input'))
      .setLabel('Embed footer image')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Image URL or server, user, client')
      .setValue(messageData?.data.embed.footerImage ?? '')
      .setMaxLength(2000)
      .setMinLength(1)

    const actionRows = [
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(footerInput),
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(footerImageInput)
    ]

    const modal = new ModalBuilder()
      .setCustomId(EmbedCommandUtils.generateComponentId(id, 'footer', 'modal'))
      .setTitle('Embed footer builder')
      .addComponents(actionRows)

    await interaction.showModal(modal)
  }

  public static async response(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string): Promise<void> {
    const messageData = client.embedConstructors.get(id)

    const footerInput = interaction.fields.getTextInputValue(EmbedCommandUtils.generateComponentId(id, 'footer', 'input'))
    const footerImageInput = interaction.fields.getTextInputValue(EmbedCommandUtils.generateComponentId(id, 'footerImage', 'modal'))

    messageData?.setEmbedFooter(footerInput, footerImageInput)

    await EmbedCommand.initialMessage(client, interaction, id)
  }
}