import { ActionRowBuilder, ButtonInteraction, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'
import NoirClient from '../../../../../structures/Client'
import SettingsCommandWelcome from './SettingsCommandWelcome'

export default class SettingsCommandWelcomeChannel {
  public static async request(client: NoirClient, interaction: ButtonInteraction, id: string) {
    const welcomeData = client.welcomeSettings.get(id)

    const channelInput = new TextInputBuilder()
      .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeChannel', 'input'))
      .setLabel('Channel Id')
      .setPlaceholder(`Enter channel Id to ${welcomeData?.data.webhook ? 'change' : 'add'}`)
      .setStyle(TextInputStyle.Short)
      .setRequired(true)

    if (welcomeData?.data.webhook) {
      channelInput.setValue(welcomeData.data.webhook)
    }

    const actionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>()
      .addComponents(channelInput)
    const modal = new ModalBuilder()
      .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeChannel', 'modal'))
      .setTitle('Welcome channel')
      .addComponents(actionRow)

    await interaction.showModal(modal)
  }

  public static async response(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string) {
    const channelId = interaction.fields.getTextInputValue(client.componentsUtils.generateId('settings', id, 'welcomeChannel', 'input'))
    const welcomeData = client.welcomeSettings.get(id)

    welcomeData?.getWebhook(client, channelId)

    await SettingsCommandWelcome.initialMessage(client, interaction, id)
  }
}