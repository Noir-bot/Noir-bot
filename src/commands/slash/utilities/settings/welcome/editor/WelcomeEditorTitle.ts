import SettingsUtils from '@commands/slash/utilities/settings/SettingsUtils'
import WelcomeEditor from '@commands/slash/utilities/settings/welcome/editor/WelcomeEditor'
import Utils from '@helpers/Utils'
import Client from '@structures/Client'
import Save from '@structures/Save'
import WelcomeMessage, { WelcomeMessageType } from '@structures/welcome/WelcomeMessage'
import { ActionRowBuilder, ButtonInteraction, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'

export default class WelcomeEditorTitle {
  public static async request(client: Client, interaction: ButtonInteraction<'cached'>, id: string, type: WelcomeMessageType) {
    const messageData = await WelcomeMessage.cache(client, id, type, false, true)

    if (!messageData) return

    const titleInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeEditorTitle', 'input'))
      .setLabel('Embed title text')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter embed title')
      .setValue(messageData.title ?? '')
      .setRequired(true)
      .setMaxLength(2000)
    const titleImageInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeEditorURL', 'input'))
      .setLabel('Embed title url')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter the title url')
      .setValue(messageData.url ?? '')
      .setRequired(false)
      .setMaxLength(2000)

    const actionRows = [
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(titleInput),
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(titleImageInput)
    ]

    const modal = new ModalBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, `welcomeEditorTitle.${type}`, 'modal'))
      .setTitle('Embed title builder')
      .addComponents(actionRows)

    await interaction.showModal(modal)
  }

  public static async response(client: Client, interaction: ModalMessageModalSubmitInteraction<'cached'>, id: string, type: WelcomeMessageType) {
    const messageData = await WelcomeMessage.cache(client, id, type, false, true)
    const saves = Save.cache(client, `${interaction.guildId}-welcome`)

    if (!messageData) return

    const titleInput = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'welcomeEditorTitle', 'input'))
    const urlInput = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'welcomeEditorURL', 'input'))

    messageData.title = WelcomeMessage.formatRemove(titleInput)
    saves.count += 1

    if (urlInput) {
      messageData.url = WelcomeMessage.formatRemove(Utils.formatURL(urlInput) ?? urlInput)
      saves.count += 1
    }

    await WelcomeEditor.initialMessage(client, interaction, id, type)
  }
}