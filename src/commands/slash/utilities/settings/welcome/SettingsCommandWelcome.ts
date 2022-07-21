import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, MessageActionRowComponentBuilder, ModalMessageModalSubmitInteraction } from 'discord.js'
import Colors from '../../../../../constants/Colors'
import Options from '../../../../../constants/Options'
import NoirClient from '../../../../../structures/Client'
import WelcomeSettings from '../collections/WelcomeSettings'
import SettingsComponents from '../SettingsCommandComponents'
import SettingsUtils from '../SettingsCommandUtils'

export default class SettingsCommandWelcome {
  public static async initialMessage(client: NoirClient, interaction: ButtonInteraction | ModalMessageModalSubmitInteraction, id: string) {
    let welcomeData = client.welcomeSettings.get(id)

    if (!welcomeData) {
      client.welcomeSettings.set(id, new WelcomeSettings(id))
      welcomeData = client.welcomeSettings.get(id)
      await welcomeData?.requestData(client)
    }

    const buttons = [
      [
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateComponentId(id, 'welcomeStatus', 'button'))
          .setLabel(`${welcomeData?.data.status ? 'Disable' : 'Enable'} system`)
          .setStyle(SettingsUtils.generateButtonStyle(welcomeData?.data.status)),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateComponentId(id, 'welcomeEditor', 'button'))
          .setLabel('Message editor')
          .setStyle(SettingsComponents.defaultButtonStyle)
          .setDisabled(!welcomeData?.data.status),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateComponentId(id, 'welcomeChannel', 'button'))
          .setLabel(`${welcomeData?.data.webhook ? 'Change' : 'Select'} message channel`)
          .setStyle(SettingsUtils.generateButtonStyle(welcomeData?.data.webhook))
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
}