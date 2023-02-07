import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, MessageActionRowComponentBuilder, ModalMessageModalSubmitInteraction } from 'discord.js'
import Colors from '../../../../../constants/Colors'
import Options from '../../../../../constants/Options'
import NoirClient from '../../../../../structures/Client'
import Moderation from '../../../../../structures/Moderation'
import SettingsUtils from '../SettingsUtils'

export default class ModerationSettings {
  public static async initialMessage(client: NoirClient, interaction: ButtonInteraction<'cached'> | ModalMessageModalSubmitInteraction<'cached'>, id: string) {
    const moderationData = await Moderation.cache(client, interaction.guildId)

    const buttons = [
      [
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, 'moderationStatus', 'button'))
          .setLabel(`${moderationData.status ? 'Disable' : 'Enable'} moderation`)
          .setStyle(SettingsUtils.generateStyle(moderationData.status))
          .setEmoji(`${moderationData?.status ? '✅' : '❌'}`),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, 'moderationLogs', 'button'))
          .setLabel('Setup logs')
          .setStyle(SettingsUtils.generateStyle(moderationData.modLogs))
          .setEmoji('📃')
          .setDisabled(!moderationData.status),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, 'moderationRules', 'button'))
          .setLabel(`${moderationData.roles.length > 0 ? 'Edit' : 'Setup'} moderation rule${moderationData.roles.length > 1 ? 's' : ''}`)
          .setStyle(SettingsUtils.generateStyle(moderationData.rulesLogs))
          .setEmoji('🎛️')
          .setDisabled(!moderationData.status)
      ],
      [
        SettingsUtils.generateBack('settings', id, 'moderationBack.settings'),
        SettingsUtils.generateSave('settings', id, 'moderationSave', client, interaction.guildId, 'moderation'),
        SettingsUtils.generateRestore('settings', id, 'moderationRestore')
      ]
    ]

    const actionRows = [
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[0]),
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[1])
    ]

    await client.reply.reply({
      interaction: interaction,
      color: Colors.primary,
      author: 'Moderation settings',
      authorImage: Options.clientAvatar,
      description: 'Must have moderation tools to automate server moderation.',
      fields: [
        {
          name: 'Moderation logs',
          value: 'Be notified about every action going on the server. Setup channel for logs and get very detailed informative message about actions.',
          inline: false
        },
        {
          name: 'Moderation rules',
          value: 'It is always great to automate moderation. Create fancy rules to automatically punish users after fixed amount of warnings.',
          inline: false
        },
        {
          name: 'Moderation cases',
          value: 'Start collecting data about moderation cases. Calculate statistics of punishments and save the data about cases and have ability to view and edit user\'s history of punishments.',
          inline: false
        }
      ],
      components: actionRows,
      ephemeral: true,
    })
  }
}