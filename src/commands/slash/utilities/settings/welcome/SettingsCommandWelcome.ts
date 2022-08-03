import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, MessageActionRowComponentBuilder, ModalMessageModalSubmitInteraction } from 'discord.js'
import Colors from '../../../../../constants/Colors'
import Options from '../../../../../constants/Options'
import NoirClient from '../../../../../structures/Client'
import SettingsCommandWelcomeCollection from '../collections/SettingsCommandWelcomeCollection'

export default class SettingsCommandWelcome {
  public static async initialMessage(client: NoirClient, interaction: ButtonInteraction | ModalMessageModalSubmitInteraction, id: string) {
    let welcomeData = client.welcomeSettings.get(id)

    if (!welcomeData) {
      client.welcomeSettings.set(id, new SettingsCommandWelcomeCollection(id))
      welcomeData = client.welcomeSettings.get(id)
      await welcomeData?.requestData(client)
    }

    const buttons = [
      [
        new ButtonBuilder()
          .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeStatus', 'button'))
          .setLabel(`${welcomeData?.data.status ? 'Disable' : 'Enable'} system`)
          .setStyle(client.componentsUtils.generateStyle(welcomeData?.data.status)),
        new ButtonBuilder()
          .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeMessages', 'button'))
          .setLabel('Message setup')
          .setStyle(client.componentsUtils.defaultStyle)
          .setDisabled(!welcomeData?.data.status),
        new ButtonBuilder()
          .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeChannel', 'button'))
          .setLabel(`${welcomeData?.data.webhook ? 'Change' : 'Add'} message channel`)
          .setStyle(client.componentsUtils.generateStyle(welcomeData?.data.webhook))
          .setDisabled(!welcomeData?.data.status),
        new ButtonBuilder()
          .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeRoles', 'button'))
          .setLabel(`${welcomeData?.data.roles[0] ? 'Add or remove' : 'Add'} welcome roles`)
          .setStyle(client.componentsUtils.generateStyle(welcomeData?.data.roles[0]))
          .setDisabled(!welcomeData?.data.status),
      ],
      [
        new ButtonBuilder()
          .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeBack', 'button'))
          .setLabel('Back to settings')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeSave', 'button'))
          .setLabel('Save welcome settings')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeReset', 'button'))
          .setLabel('Reset to last settings')
          .setStyle(ButtonStyle.Danger),
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
      description: 'Welcome system settings. Get powerful welcome with easy setup. Powerful and fully customizable messages, multiple auto roles and customizable webhook',
      components: actionRows,
      ephemeral: true,
    })
  }
}