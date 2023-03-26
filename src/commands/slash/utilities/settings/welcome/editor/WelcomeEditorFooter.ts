import SettingsUtils from '@commands/slash/utilities/settings/SettingsUtils'
import WelcomeEditor from '@commands/slash/utilities/settings/welcome/editor/WelcomeEditor'
import Client from '@structures/Client'
import Save from '@structures/Save'
import WelcomeMessage, { WelcomeMessageType } from '@structures/welcome/WelcomeMessage'
import { ActionRowBuilder, ButtonInteraction, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'

export default class WelcomeEditorFooter {
  public static async request(client: Client, interaction: ButtonInteraction<'cached'>, id: string, type: WelcomeMessageType) {
    const messageData = await WelcomeMessage.cache(client, id, type, false, true)

    const footerInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeEditorFooter', 'input'))
      .setLabel('Embed footer name')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter footer text')
      .setValue(messageData.footer ?? '')
      .setRequired(true)
      .setMaxLength(2000)
    const footerImageInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeEditorFooterImage', 'input'))
      .setLabel('Embed footer image')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Image URL or server, user, client')
      .setValue(messageData.rawFooterImage ?? '')
      .setRequired(false)
      .setMaxLength(2000)

    const actionRows = [
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(footerInput),
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(footerImageInput)
    ]

    const modal = new ModalBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, `welcomeEditorFooter.${type}`, 'modal'))
      .setTitle('Embed footer builder')
      .addComponents(actionRows)

    await interaction.showModal(modal)
  }

  public static async response(client: Client, interaction: ModalMessageModalSubmitInteraction<'cached'>, id: string, type: WelcomeMessageType) {
    const messageData = await WelcomeMessage.cache(client, id, type, false, true)
    const saves = Save.cache(client, `${interaction.guildId}-welcome`)

    if (!messageData) return

    const footerInput = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'welcomeEditorFooter', 'input'))
    const footerImageInput = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'welcomeEditorFooterImage', 'input'))
    saves.count += 1

    messageData.footer = WelcomeMessage.formatRemove(footerInput)

    if (footerImageInput) {
      const formatted = WelcomeMessage.formatImage(footerImageInput, { guild: interaction.guild.iconURL(), client: client.user?.avatarURL(), user: client.user?.avatarURL() })

      if (!formatted) return

      messageData.footerImage = formatted == footerImageInput ? undefined : formatted
      messageData.rawFooterImage = WelcomeMessage.formatRemove(footerImageInput)
      saves.count += 1
    }

    await WelcomeEditor.initialMessage(client, interaction, id, type)
  }
}