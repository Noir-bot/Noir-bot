import { ActionRowBuilder, ButtonInteraction, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'
import NoirClient from '../../../../../structures/Client'
import SettingsCommandUtils from '../SettingsCommandUtils'
import SettingsCommandWelcome from './SettingsCommandWelcome'

export default class SettingsCommandWelcomeChannel {
  public static async request(client: NoirClient, interaction: ButtonInteraction, id: string) {
    const welcomeData = client.welcomeSettings.get(id)

    const channelInput = new TextInputBuilder()
      .setCustomId(SettingsCommandUtils.generateComponentId(id, 'welcomeChannel', 'input'))
      .setLabel('Channel Id')
      .setPlaceholder(`Enter channel Id to ${welcomeData?.data.webhook ? 'change' : 'add'}`)
      .setStyle(TextInputStyle.Short)
      .setRequired(true)

    if (welcomeData?.data.channel) {
      channelInput.setValue(welcomeData.data.channel)
    }

    const actionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>()
      .addComponents(channelInput)
    const modal = new ModalBuilder()
      .setCustomId(SettingsCommandUtils.generateComponentId(id, 'welcomeChannel', 'modal'))
      .setTitle('Welcome channel')
      .addComponents(actionRow)

    await interaction.showModal(modal)
  }

  public static async response(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string) {
    const channelId = interaction.fields.getTextInputValue(SettingsCommandUtils.generateComponentId(id, 'welcomeChannel', 'input'))
    const welcomeData = client.welcomeSettings.get(id)

    welcomeData?.getWebhook(client, channelId)

    await SettingsCommandWelcome.initialMessage(client, interaction, id)
  }
}