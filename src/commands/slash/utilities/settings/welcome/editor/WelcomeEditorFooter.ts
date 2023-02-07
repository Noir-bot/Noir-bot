import { ActionRowBuilder, ButtonInteraction, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'
import Options from '../../../../../../constants/Options'
import NoirClient from '../../../../../../structures/Client'
import Save from '../../../../../../structures/Save'
import WelcomeMessage, { WelcomeMessageType } from '../../../../../../structures/WelcomeMessage'
import SettingsUtils from '../../SettingsUtils'
import WelcomeEditor from './WelcomeEditor'

export default class WelcomeEditorFooter {
  public static async request(client: NoirClient, interaction: ButtonInteraction<'cached'>, id: string, type: WelcomeMessageType) {
    const messageData = await WelcomeMessage.cache(client, id, type)

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

  public static async response(client: NoirClient, interaction: ModalMessageModalSubmitInteraction<'cached'>, id: string, type: WelcomeMessageType) {
    const messageData = await WelcomeMessage.cache(client, id, type)
    const saves = Save.cache(client, `${interaction.guildId}-welcome`)

    if (!messageData) return

    const footerInput = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'welcomeEditorFooter', 'input'))
    const footerImageInput = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'welcomeEditorFooterImage', 'input'))
    saves.count += 1

    messageData.footer = WelcomeMessage.formatRemove(footerInput)

    if (footerImageInput) {
      const formatted = WelcomeMessage.formatVariable(client.utils.formatURL(footerImageInput), { client: { avatar: Options.clientAvatar }, guild: { icon: interaction.guild.iconURL() } })

      messageData.footerImage = formatted == footerImageInput ? undefined : formatted
      messageData.rawFooterImage = WelcomeMessage.formatRemove(footerImageInput)
      saves.count += 1
    }

    await WelcomeEditor.initialMessage(client, interaction, id, type)
  }
}