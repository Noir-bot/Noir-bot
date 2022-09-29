import { ActionRowBuilder, ButtonInteraction, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'
import { WelcomeMessageType } from '../../../../../../constants/Options'
import NoirClient from '../../../../../../structures/Client'
import SettingsUtils from '../../SettingsUtils'
import WelcomeEditor from './WelcomeEditor'

export default class WelcomeEditorMessage {
  public static async request(client: NoirClient, interaction: ButtonInteraction, id: string, type: WelcomeMessageType) {
    const { messageData } = await WelcomeEditor.getMessageType(client, id, type)

    const messageInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeEditorMessage', 'input'))
      .setLabel('Message content')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter unembeded message content')
      .setValue(messageData?.embed.author ?? '')
      .setRequired(true)
      .setMaxLength(1000)
      .setMinLength(1)

    const actionRows = [
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(messageInput),
    ]

    const modal = new ModalBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, `welcomeEditorMessage.${type}`, 'modal'))
      .setTitle('Message content editor')
      .addComponents(actionRows)

    await interaction.showModal(modal)
  }

  public static async response(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string, type: WelcomeMessageType) {
    const { messageData } = await WelcomeEditor.getMessageType(client, id, type)

    const messageInput = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'welcomeEditorMessage', 'input'))

    if (!messageData) return

    messageData.message = client.utils.removeFormatValue(messageInput)

    await WelcomeEditor.initialMessage(client, interaction, id, type)
  }
}