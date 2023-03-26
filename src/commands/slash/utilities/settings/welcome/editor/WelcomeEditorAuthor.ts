import Client from '@structures/Client'
import Save from '@structures/Save'
import WelcomeMessage, { WelcomeMessageType } from '@structures/welcome/WelcomeMessage'
import { ActionRowBuilder, ButtonInteraction, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'
import SettingsUtils from '../../SettingsUtils'
import WelcomeEditor from './WelcomeEditor'

export default class WelcomeEditorAuthor {
  public static async request(client: Client, interaction: ButtonInteraction<'cached'>, id: string, type: WelcomeMessageType) {
    const messageData = await WelcomeMessage.cache(client, id, type, false, true)

    const authorInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeEditorAuthor', 'input'))
      .setLabel('Embed author')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter embed author name')
      .setValue(messageData?.author ?? '')
      .setMaxLength(2000)
      .setRequired(true)
    const authorImageInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeEditorAuthorImage', 'input'))
      .setLabel('Embed author image')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter image URL or server, user, client')
      .setValue(messageData?.rawAuthorImage ?? '')
      .setMaxLength(2000)

    const actionRows = [
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(authorInput),
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(authorImageInput)
    ]

    const modal = new ModalBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, `welcomeEditorAuthor.${type}`, 'modal'))
      .setTitle('Embed author builder')
      .addComponents(actionRows)

    await interaction.showModal(modal)
  }

  public static async response(client: Client, interaction: ModalMessageModalSubmitInteraction<'cached'>, id: string, type: WelcomeMessageType) {
    const messageData = await WelcomeMessage.cache(client, id, type, false, true)
    const saves = Save.cache(client, `${interaction.guildId}-welcome`)

    const authorInput = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'welcomeEditorAuthor', 'input'))
    const authorImageInput = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'welcomeEditorAuthorImage', 'input'))

    if (!messageData) return

    messageData.author = WelcomeMessage.formatRemove(authorInput)
    saves.count += 1

    if (authorImageInput) {
      const formatted = WelcomeMessage.formatImage(authorImageInput, { guild: interaction.guild.iconURL(), client: client.user?.avatarURL(), user: client.user?.avatarURL() })

      console.log(formatted)

      if (!formatted) return

      messageData.authorImage = formatted == authorImageInput ? undefined : formatted
      messageData.rawAuthorImage = WelcomeMessage.formatRemove(authorImageInput)
      saves.count += 1
    }

    await WelcomeEditor.initialMessage(client, interaction, id, type)
  }
}