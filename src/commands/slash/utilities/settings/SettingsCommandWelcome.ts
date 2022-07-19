import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, MessageActionRowComponentBuilder, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'
import WelcomeSettings from '../../../../collections/settings/WelcomeSettings'
import Colors from '../../../../constants/Colors'
import Options from '../../../../constants/Options'
import NoirClient from '../../../../structures/Client'
import SettingsComponents from './SettingsCommandComponents'
import SettingsUtils from './SettingsCommandUtils'

export default class SettingsCommandWelcome {
  public static async initialMessage(client: NoirClient, interaction: ButtonInteraction | ModalMessageModalSubmitInteraction, id: string) {
    let welcomeData = client.welcomeSettings.get(id)

    if (!welcomeData) {
      client.welcomeSettings.set(id, new WelcomeSettings(id))
      welcomeData = client.welcomeSettings.get(id)
      await welcomeData?.send(client)
    }

    const buttons = [
      [
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateComponentId(id, 'welcomeStatus', 'button'))
          .setLabel(`${welcomeData?.data.status ? 'Disable' : 'Enable'} welcome`)
          .setStyle(SettingsUtils.generateButtonStyle(welcomeData?.data.status)),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateComponentId(id, 'welcomeMessagesEditor', 'button'))
          .setLabel('Message editor')
          .setStyle(SettingsComponents.defaultButtonStyle)
          .setDisabled(!welcomeData?.data.status),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateComponentId(id, 'welcomeChannel', 'button'))
          .setLabel(`${welcomeData?.data.channel ? 'Change' : 'Select'} welcome channel`)
          .setStyle(SettingsUtils.generateButtonStyle(welcomeData?.data.channel))
          .setDisabled(!welcomeData?.data.status),
      ],
      [
        SettingsComponents.backButton(id, 'welcome'),
        SettingsComponents.saveButton(id, 'welcome'),
        SettingsComponents.resetButton(id, 'welcome')
      ]
    ]

    const actionRows = [
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[0]),
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[1])
    ]

    await client.reply.reply({
      interaction: interaction,
      color: Colors.primary,
      author: 'Welcome settings',
      authorImage: Options.clientAvatar,
      description: 'Welcome system settings. Enable welcome system, add channel and construct embed messages with out powerful editor.',
      components: actionRows,
      ephemeral: true,
    })
  }

  public static async channelRequest(client: NoirClient, interaction: ButtonInteraction, id: string) {
    const welcomeData = client.welcomeSettings.get(id)

    const channelInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateComponentId(id, 'welcomeChannel', 'input'))
      .setLabel('Channel Id')
      .setPlaceholder(`Send welcome channel Id to ${welcomeData?.data.channel ? 'change' : 'set'}`)
      .setStyle(TextInputStyle.Short)
      .setRequired(true)

    if (welcomeData?.data.channel) {
      channelInput.setValue(welcomeData.data.channel)
    }

    const actionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>()
      .addComponents(channelInput)
    const modal = new ModalBuilder()
      .setCustomId(SettingsUtils.generateComponentId(id, 'welcomeChannel', 'modal'))
      .setTitle('Welcome channel')
      .addComponents(actionRow)

    await interaction.showModal(modal)
  }

  public static async channelResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string) {
    const channelId = interaction.fields.getTextInputValue(SettingsUtils.generateComponentId(id, 'welcomeChannel', 'input'))
    const welcomeData = client.welcomeSettings.get(id)

    welcomeData?.setChannel(client, channelId)

    // await SettingsWelcome.initialMessage(client, interaction, id)
  }
}