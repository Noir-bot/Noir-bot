import { ActionRowBuilder, ButtonInteraction, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'
import NoirClient from '../../../../../structures/Client'
import SettingsCommandUtils from '../SettingsCommandUtils'
import SettingsCommandWelcome from './SettingsCommandWelcome'

export default class SettingsCommandWelcomeRole {
  public static async request(client: NoirClient, interaction: ButtonInteraction, id: string) {
    const welcomeData = client.welcomeSettings.get(id)

    const roleInput = new TextInputBuilder()
      .setCustomId(SettingsCommandUtils.generateComponentId(id, 'welcomeRole', 'input'))
      .setLabel('Role Id')
      .setPlaceholder(`Enter role Id to ${welcomeData?.data.webhook ? 'change' : 'add'}`)
      .setStyle(TextInputStyle.Short)
      .setRequired(true)

    if (welcomeData?.data.role) {
      roleInput.setValue(welcomeData.data.role)
    }

    const actionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>()
      .addComponents(roleInput)
    const modal = new ModalBuilder()
      .setCustomId(SettingsCommandUtils.generateComponentId(id, 'welcomeRole', 'modal'))
      .setTitle('Welcome role')
      .addComponents(actionRow)

    await interaction.showModal(modal)
  }

  public static async response(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string) {
    const roleId = interaction.fields.getTextInputValue(SettingsCommandUtils.generateComponentId(id, 'welcomeRole', 'input'))
    const welcomeData = client.welcomeSettings.get(id)

    welcomeData?.getRole(interaction, roleId)

    await SettingsCommandWelcome.initialMessage(client, interaction, id)
  }
}