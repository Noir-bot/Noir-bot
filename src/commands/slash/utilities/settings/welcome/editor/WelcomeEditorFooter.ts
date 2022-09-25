import { ActionRowBuilder, ButtonInteraction, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'
import { WelcomeMessageType } from '../../../../../../constants/Options'
import NoirClient from '../../../../../../structures/Client'
import WelcomeEditor from './WelcomeEditor'

export default class WelcomeEditorFooter {
  public static async request(client: NoirClient, interaction: ButtonInteraction, id: string, type: WelcomeMessageType) {
    const { messageData } = WelcomeEditor.getMessageType(client, id, type)

    const footerInput = new TextInputBuilder()
      .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeEditorFooter', 'input'))
      .setLabel('Embed footer name')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter footer text')
      .setValue(messageData?.embed.footer ?? '')
      .setRequired(true)
      .setMaxLength(2000)
      .setMinLength(1)
    const footerImageInput = new TextInputBuilder()
      .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeEditorFooterImage', 'input'))
      .setLabel('Embed footer image')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Image URL or server, user, client')
      .setValue(messageData?.embed.rawFooterImage ?? '')
      .setRequired(false)
      .setMaxLength(2000)
      .setMinLength(1)

    const actionRows = [
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(footerInput),
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(footerImageInput)
    ]

    const modal = new ModalBuilder()
      .setCustomId(client.componentsUtils.generateId('settings', id, `welcomeEditorFooter.${type}`, 'modal'))
      .setTitle('Embed footer builder')
      .addComponents(actionRows)

    await interaction.showModal(modal)
  }

  public static async response(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string, type: WelcomeMessageType) {
    const { messageData } = WelcomeEditor.getMessageType(client, id, type)

    if (!messageData) return

    const footerInput = interaction.fields.getTextInputValue(client.componentsUtils.generateId('settings', id, 'welcomeEditorFooter', 'input'))
    const footerImageInput = interaction.fields.getTextInputValue(client.componentsUtils.generateId('settings', id, 'welcomeEditorFooterImage', 'input'))

    messageData.embed.footer = client.utils.removeFormatValue(footerInput)

    if (footerImageInput) {
      messageData.embed.footerImage = client.utils.removeFormatValue(client.utils.formatURL(footerImageInput))
      messageData.embed.rawFooterImage = client.utils.removeFormatValue(footerImageInput)
    }

    await WelcomeEditor.initialMessage(client, interaction, id, type)
  }
}