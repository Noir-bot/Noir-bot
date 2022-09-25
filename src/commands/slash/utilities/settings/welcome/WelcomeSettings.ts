import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, MessageActionRowComponentBuilder, ModalMessageModalSubmitInteraction } from 'discord.js'
import Colors from '../../../../../constants/Colors'
import Options from '../../../../../constants/Options'
import NoirClient from '../../../../../structures/Client'
import WelcomeCollection from '../collections/WelcomeCollection'

export default class WelcomeSettings {
  public static async generateCache(client: NoirClient, id: string) {
    client.welcomeSettings.set(id, new WelcomeCollection(id))
    const welcomeData = client.welcomeSettings.get(id)
    await welcomeData?.cacheData(client)
    return welcomeData?.data
  }

  public static async initialMessage(client: NoirClient, interaction: ButtonInteraction | ModalMessageModalSubmitInteraction, id: string) {
    let welcomeData = client.welcomeSettings.get(id)

    if (!welcomeData) {
      client.welcomeSettings.set(id, new WelcomeCollection(id))
      welcomeData = client.welcomeSettings.get(id)
      await welcomeData?.cacheData(client)
    }

    const buttons = [
      [
        new ButtonBuilder()
          .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeStatus', 'button'))
          .setLabel(`${welcomeData?.data.status ? 'Disable' : 'Enable'} feature`)
          .setStyle(client.componentsUtils.generateStyle(welcomeData?.data.status)),
        new ButtonBuilder()
          .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeRoleRestore', 'button'))
          .setLabel(`${welcomeData?.data.restoreRoles ? 'Disable' : 'Enable'} role restoring`)
          .setStyle(client.componentsUtils.generateStyle(welcomeData?.data.restoreRoles))
      ],
      [
        new ButtonBuilder()
          .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeEditor', 'button'))
          .setLabel('Setup messages')
          .setStyle(client.componentsUtils.defaultStyle)
          .setDisabled(!welcomeData?.data.status),
        new ButtonBuilder()
          .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeWebhook', 'button'))
          .setLabel(`${welcomeData?.data.webhook ? 'Change' : 'Setup'} webhook`)
          .setStyle(client.componentsUtils.generateStyle(welcomeData?.data.webhook))
          .setDisabled(!welcomeData?.data.status),
        new ButtonBuilder()
          .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeRole', 'button'))
          .setLabel(`${welcomeData?.data.roles[0] ? 'Edit' : 'Add'} auto-role`)
          .setStyle(client.componentsUtils.generateStyle(welcomeData?.data.roles[0]))
          .setDisabled(!welcomeData?.data.status),
      ],
      [
        client.componentsUtils.generateBack('settings', id, 'welcomeBack.settings'),
        client.componentsUtils.generateSave('settings', id, 'welcomeSave'),
        client.componentsUtils.generateRestore('settings', id, 'welcomeRestore')
      ]
    ]

    const actionRows = [
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[0]),
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[1]),
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[2]),
    ]

    await client.reply.reply({
      interaction: interaction,
      color: Colors.primary,
      author: 'Welcome settings',
      authorImage: Options.clientAvatar,
      description: 'Powerful welcoming tools and features. Fully customizable welcome messages, auto role, role restoring and custom webhook.',
      components: actionRows,
      ephemeral: true,
    })
  }
}