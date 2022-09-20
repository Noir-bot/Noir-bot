import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  MessageActionRowComponentBuilder,
  ModalMessageModalSubmitInteraction
} from 'discord.js'
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
      await welcomeData?.cacheData(client)
    }

    const buttons = [
      [
        new ButtonBuilder()
          .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeStatus', 'button'))
          .setLabel(`${welcomeData?.data.status ? 'Disable' : 'Enable'} system`)
          .setStyle(client.componentsUtils.generateStyle(welcomeData?.data.status)),
        new ButtonBuilder()
          .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeEditor', 'button'))
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
          .setLabel(`${welcomeData?.data.roles[0] ? 'Edit' : 'Add'} welcome roles`)
          .setStyle(client.componentsUtils.generateStyle(welcomeData?.data.roles[0]))
          .setDisabled(!welcomeData?.data.status),
      ],
      [
        client.componentsUtils.generateBack('settings', id, 'welcomeBack'),
        client.componentsUtils.generateSave('settings', id, 'welcomeSave'),
        client.componentsUtils.generateRestore('settings', id, 'welcomeRestore')
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