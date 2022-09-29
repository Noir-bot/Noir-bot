import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, MessageActionRowComponentBuilder, ModalMessageModalSubmitInteraction } from 'discord.js'
import Colors from '../../../../../constants/Colors'
import Options from '../../../../../constants/Options'
import NoirClient from '../../../../../structures/Client'
import ModerationCollection from '../collections/ModerationCollection'
import SettingsUtils from '../SettingsUtils'

export default class ModerationSettings {
  public static async generateCache(client: NoirClient, id: string) {
    client.moderationSettings.set(id, new ModerationCollection(id))
    const moderationData = client.moderationSettings.get(id)
    await moderationData?.cacheData(client)

    return moderationData?.data
  }

  public static async initialMessage(client: NoirClient, interaction: ButtonInteraction | ModalMessageModalSubmitInteraction, id: string) {
    let moderationData = client.moderationSettings.get(id)

    if (!moderationData) {
      client.moderationSettings.set(id, new ModerationCollection(id))
      moderationData = client.moderationSettings.get(id)
      await moderationData?.cacheData(client)
    }

    const buttons = [
      [
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, 'moderationLogs', 'button'))
          .setLabel('Setup logs')
          .setStyle(SettingsUtils.generateStyle(moderationData?.data.logs.status)),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, 'moderationRules', 'button'))
          .setLabel('Setup rules')
          .setStyle(SettingsUtils.generateStyle(moderationData?.data.rules.status)),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, 'moderationCases', 'button'))
          .setLabel('Collect case data')
          .setStyle(SettingsUtils.generateStyle(moderationData?.data.collectCases))
      ],
      [
        SettingsUtils.generateBack('settings', id, 'moderationBack.settings'),
        SettingsUtils.generateSave('settings', id, 'moderationSave'),
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