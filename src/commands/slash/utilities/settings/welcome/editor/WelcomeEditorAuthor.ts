import { ActionRowBuilder, ButtonInteraction, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'
import { WelcomeMessageType } from '../../../../../../constants/Options'
import NoirClient from '../../../../../../structures/Client'
import WelcomeEditor from './WelcomeEditor'

export default class WelcomeEditorAuthor {
  public static async request(client: NoirClient, interaction: ButtonInteraction, id: string, type: WelcomeMessageType) {
    const { messageData } = WelcomeEditor.getMessageType(client, id, type)

    const authorInput = new TextInputBuilder()
      .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeEditorAuthor', 'input'))
      .setLabel('Embed author')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter embed author name')
      .setValue(messageData?.embed.author ?? '')
      .setRequired(true)
      .setMaxLength(2000)
      .setMinLength(1)
    const authorImageInput = new TextInputBuilder()
      .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeEditorAuthorImage', 'input'))
      .setLabel('Embed author image')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter image URL or server, user, client')
      .setValue(messageData?.embed.rawAuthorImage ?? '')
      .setRequired(false)
      .setMaxLength(2000)
      .setMinLength(1)

    const actionRows = [
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(authorInput),
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(authorImageInput)
    ]

    const modal = new ModalBuilder()
      .setCustomId(client.componentsUtils.generateId('settings', id, `welcomeEditorAuthor.${type}`, 'modal'))
      .setTitle('Embed author builder')
      .addComponents(actionRows)

    await interaction.showModal(modal)
  }

  public static async response(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string, type: WelcomeMessageType) {
    const { messageData } = WelcomeEditor.getMessageType(client, id, type)

    const authorInput = interaction.fields.getTextInputValue(client.componentsUtils.generateId('settings', id, 'welcomeEditorAuthor', 'input'))
    const authorImageInput = interaction.fields.getTextInputValue(client.componentsUtils.generateId('settings', id, 'welcomeEditorAuthorImage', 'input'))

    if (!messageData) return

    messageData.embed.author = client.utils.removeFormatValue(authorInput)

    if (authorImageInput) {
      messageData.embed.authorImage = client.utils.removeFormatValue(client.utils.formatImage(interaction, authorImageInput))
      messageData.embed.rawAuthorImage = client.utils.removeFormatValue(authorImageInput)
    }

    await WelcomeEditor.initialMessage(client, interaction, id, type)
  }
}