import { ActionRowBuilder, ButtonInteraction, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'
import NoirClient from '../../../../../../structures/Client'
import Save from '../../../../../../structures/Save'
import WelcomeMessage, { WelcomeMessageType } from '../../../../../../structures/WelcomeMessage'
import SettingsUtils from '../../SettingsUtils'
import WelcomeEditor from './WelcomeEditor'

export default class WelcomeEditorMessage {
  public static async request(client: NoirClient, interaction: ButtonInteraction<'cached'>, id: string, type: WelcomeMessageType) {
    const messageData = await WelcomeMessage.cache(client, id, type)

    const messageInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeEditorMessage', 'input'))
      .setLabel('Message content')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter unembeded message content')
      .setValue(messageData?.message ?? '')
      .setRequired(true)
      .setMaxLength(1000)

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

  public static async response(client: NoirClient, interaction: ModalMessageModalSubmitInteraction<'cached'>, id: string, type: WelcomeMessageType) {
    const messageData = await WelcomeMessage.cache(client, id, type)

    if (!messageData) return

    const messageInput = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'welcomeEditorMessage', 'input'))

    messageData.message = WelcomeMessage.formatRemove(messageInput)

    const saves = Save.cache(client, `${interaction.guildId}-welcome`)
    saves.count += 1

    await WelcomeEditor.initialMessage(client, interaction, id, type)
  }
}