import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, MessageActionRowComponentBuilder, ModalMessageModalSubmitInteraction } from 'discord.js'
import Colors from '../../../../../constants/Colors'
import Options from '../../../../../constants/Options'
import NoirClient from '../../../../../structures/Client'
import WelcomeCollection from '../collections/WelcomeCollection'
import SettingsUtils from '../SettingsUtils'

export default class WelcomeSettings {
  public static async generateCache(client: NoirClient, id: string) {
    client.welcomeSettings.set(id, new WelcomeCollection(id))
    const welcomeData = client.welcomeSettings.get(id)
    await welcomeData?.cacheData(client)
    return welcomeData?.data
  }

  public static async initialMessage(client: NoirClient, interaction: ButtonInteraction | ModalMessageModalSubmitInteraction, id: string) {
    let welcomeData = client.welcomeSettings.get(id)?.data

    if (!welcomeData) {
      welcomeData = await this.generateCache(client, id)
    }

    const buttons = [
      [
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeStatus', 'button'))
          .setLabel(`${welcomeData?.status ? 'Disable' : 'Enable'} welcome features`)
          .setStyle(SettingsUtils.generateStyle(welcomeData?.status)),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeRolesRestore', 'button'))
          .setLabel(`${welcomeData?.restoreRoles ? 'Disable' : 'Enable'} role-restoring`)
          .setStyle(SettingsUtils.generateStyle(welcomeData?.restoreRoles))
      ],
      [
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeEditor', 'button'))
          .setLabel('Setup messages')
          .setStyle(SettingsUtils.generateStyle(welcomeData?.messages.guild.status || welcomeData?.messages.direct.status))
          .setDisabled(!welcomeData?.status),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeWebhook', 'button'))
          .setLabel(`${welcomeData?.webhook ? 'Edit' : 'Setup'} webhook`)
          .setStyle(SettingsUtils.generateStyle(welcomeData?.webhook))
          .setDisabled(!welcomeData?.status),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeRoles', 'button'))
          .setLabel(`${welcomeData?.roles[0] ? 'Edit' : 'Setup'} roles`)
          .setStyle(SettingsUtils.generateStyle(welcomeData?.roles[0]))
          .setDisabled(!welcomeData?.status),
      ],
      [
        SettingsUtils.generateBack('settings', id, 'welcomeBack.settings'),
        SettingsUtils.generateSave('settings', id, 'welcomeSave'),
        SettingsUtils.generateRestore('settings', id, 'welcomeRestore')
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
      description: 'Fully customizable welcoming features and tools.',
      fields: [
        {
          name: 'Auto-role and role-restoring',
          value: 'Give new users roles and save them if they leave the server. Able to save roles after user left the server and give it back when he returns.',
          inline: false
        },
        {
          name: 'Auto-message and webhook',
          value: 'Advanced message editor and fully customizable webhook. Setup message and welcome new users with fancy message.',
          inline: false
        }
      ],
      footer: 'Some features are partially premium only.',
      components: actionRows,
      ephemeral: true,
    })
  }
}