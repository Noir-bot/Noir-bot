import SettingsUtils from '@commands/slash/utilities/settings/SettingsUtils'
import Colors from '@constants/Colors'
import Emojis from '@constants/Emojis'
import Reply from '@helpers/Reply'
import Client from '@structures/Client'
import Welcome from '@structures/welcome/Welcome'
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, MessageActionRowComponentBuilder, ModalMessageModalSubmitInteraction } from 'discord.js'

export default class WelcomeSettings {
  public static async initialMessage(client: Client, interaction: ButtonInteraction<'cached'> | ModalMessageModalSubmitInteraction<'cached'>, id: string) {
    let welcomeData = await Welcome.cache(client, interaction.guildId)

    const buttons = [
      [
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeStatus', 'button'))
          .setLabel(`${welcomeData?.status ? 'Disable' : 'Enable'} features`)
          .setStyle(SettingsUtils.generateStyle(welcomeData?.status))
          .setEmoji(`${welcomeData?.status ? Emojis.enable : Emojis.disable}`),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeRolesRestore', 'button'))
          .setLabel(`${welcomeData?.restore ? 'Disable' : 'Enable'} role-restoring`)
          .setStyle(SettingsUtils.generateStyle(welcomeData?.restore))
          .setEmoji(`${welcomeData?.restore ? Emojis.enable : Emojis.disable}`),
      ],
      [
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeEditor', 'button'))
          .setLabel('Message editor')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(!welcomeData?.status)
          .setEmoji('✏️'),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeWebhook', 'button'))
          .setLabel(`${welcomeData?.roles?.length ? 'Edit' : 'Setup'} webhook`)
          .setStyle(SettingsUtils.generateStyle(welcomeData.webhook))
          .setDisabled(!welcomeData?.status)
          .setEmoji('🛩️'),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeRoles', 'button'))
          .setLabel(`${welcomeData?.roles?.length ? 'Edit' : 'Setup'} role${welcomeData?.roles && welcomeData.roles.length > 1 ? 's' : ''}`)
          .setStyle(SettingsUtils.generateStyle(welcomeData.roles?.length))
          .setDisabled(!welcomeData?.status)
          .setEmoji('🎭'),
      ],
      [
        SettingsUtils.generateBack('settings', id, 'welcomeBack.settings'),
        SettingsUtils.generateSave('settings', id, 'welcomeSave', client, interaction.guildId, 'welcome'),
        SettingsUtils.generateRestore('settings', id, 'welcomeRestore')
      ]
    ]

    const actionRows = [
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[0]),
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[1]),
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[2]),
    ]

    await Reply.reply({
      client: client,
      interaction: interaction,
      color: Colors.primary,
      author: 'Welcome settings',
      authorImage: client.user?.avatarURL(),
      description: 'Fully customizable welcoming features and tools.',
      fields: [
        {
          name: 'Auto-role & role-restore',
          value: 'Give roles to new users and return them on rejoin.',
          inline: false
        },
        {
          name: 'Auto-message & webhook',
          value: 'Welcome new users with fully customizable messages.',
          inline: false
        }
      ],
      components: actionRows,
      ephemeral: true,
    })
  }
}