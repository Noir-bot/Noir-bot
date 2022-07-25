import { ActionRowBuilder, ButtonInteraction, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'
import NoirClient from '../../../../../../structures/Client'
import SettingsCommandUtils from '../../SettingsCommandUtils'
import SettingsCommandWelcomeEditor from '../SettingsCommandWelcomeEditor'

export default class SettingsCommandWelcomeAuthor {
  public static async request(client: NoirClient, interaction: ButtonInteraction, id: string, type: string): Promise<void> {
    const messageData = client.embeds.get(id)

    const authorInput = new TextInputBuilder()
      .setCustomId(SettingsCommandUtils.generateComponentId(id, `author:${type}`, 'input'))
      .setLabel('Embed author text')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter embed author text')
      .setValue(messageData?.data.embed.author ?? '')
      .setRequired(true)
      .setMaxLength(2000)
      .setMinLength(1)
    const authorImageInput = new TextInputBuilder()
      .setCustomId(SettingsCommandUtils.generateComponentId(id, `authorImage:${type}`, 'input'))
      .setLabel('Embed author image')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Image URL or server, user, client')
      .setValue(messageData?.data.embed.authorImage ?? '')
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
      .setCustomId(SettingsCommandUtils.generateComponentId(id, `author:${type}`, 'modal'))
      .setTitle('Embed author builder')
      .addComponents(actionRows)

    await interaction.showModal(modal)
  }

  public static async response(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string, type: string): Promise<void> {
    const messageData = client.embeds.get(id)

    const authorInput = interaction.fields.getTextInputValue(SettingsCommandUtils.generateComponentId(id, `author:${type}`, 'input'))
    const authorImageInput = interaction.fields.getTextInputValue(SettingsCommandUtils.generateComponentId(id, `authorImage:${type}`, 'input'))

    messageData?.setEmbedAuthor(authorInput, authorImageInput)

    await SettingsCommandWelcomeEditor.editorMessage(client, interaction, id, type)
  }
}