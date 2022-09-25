import { ActionRowBuilder, ButtonInteraction, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'
import { WelcomeMessageType } from '../../../../../../constants/Options'
import NoirClient from '../../../../../../structures/Client'
import WelcomeEditor from './WelcomeEditor'

export default class WelcomeEditorTitle {
  public static async request(client: NoirClient, interaction: ButtonInteraction, id: string, type: WelcomeMessageType) {
    const { messageData } = WelcomeEditor.getMessageType(client, id, type)

    if (!messageData) return

    const titleInput = new TextInputBuilder()
      .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeEditorTitle', 'input'))
      .setLabel('Embed title text')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter embed title')
      .setValue(messageData.embed.title ?? '')
      .setRequired(true)
      .setMaxLength(2000)
      .setMinLength(1)
    const titleImageInput = new TextInputBuilder()
      .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeEditorURL', 'input'))
      .setLabel('Embed title url')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter the title url')
      .setValue(messageData.embed.url ?? '')
      .setRequired(false)
      .setMaxLength(2000)
      .setMinLength(1)

    const actionRows = [
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(titleInput),
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(titleImageInput)
    ]

    const modal = new ModalBuilder()
      .setCustomId(client.componentsUtils.generateId('settings', id, `welcomeEditorTitle.${type}`, 'modal'))
      .setTitle('Embed title builder')
      .addComponents(actionRows)

    await interaction.showModal(modal)
  }

  public static async response(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string, type: WelcomeMessageType) {
    const { messageData } = WelcomeEditor.getMessageType(client, id, type)

    if (!messageData) return

    const titleInput = interaction.fields.getTextInputValue(client.componentsUtils.generateId('settings', id, 'welcomeEditorTitle', 'input'))
    const urlInput = interaction.fields.getTextInputValue(client.componentsUtils.generateId('settings', id, 'welcomeEditorURL', 'input'))

    messageData.embed.title = client.utils.removeFormatValue(titleInput)

    if (urlInput) {
      messageData.embed.url = client.utils.removeFormatValue(client.utils.formatURL(urlInput))
    }

    await WelcomeEditor.initialMessage(client, interaction, id, type)
  }
}