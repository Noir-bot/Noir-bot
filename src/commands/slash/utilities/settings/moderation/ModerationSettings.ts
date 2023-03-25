import SettingsUtils from '@commands/slash/utilities/settings/SettingsUtils'
import Colors from '@constants/Colors'
import Emojis from '@constants/Emojis'
import Options from '@constants/Options'
import Reply from '@helpers/Reply'
import Client from '@structures/Client'
import Moderation from '@structures/moderation/Moderation'
import ModerationRules from '@structures/moderation/ModerationRules'
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, MessageActionRowComponentBuilder, ModalMessageModalSubmitInteraction } from 'discord.js'

export default class ModerationSettings {
  public static async initialMessage(client: Client, interaction: ButtonInteraction<'cached'> | ModalMessageModalSubmitInteraction<'cached'>, id: string) {
    const moderationData = await Moderation.cache(client, interaction.guildId, false, true)
    const moderationRules = await ModerationRules.cache(client, interaction.guildId, false, true)

    const buttons = [
      [
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, 'moderationStatus', 'button'))
          .setLabel(`${moderationData.status ? 'Disable' : 'Enable'} features`)
          .setStyle(SettingsUtils.generateStyle(moderationData.status))
          .setEmoji(`${moderationData?.status ? Emojis.enable : Emojis.disable}`),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, 'moderationLogs', 'button'))
          .setLabel('Setup logs')
          .setStyle(SettingsUtils.generateStyle(moderationData.logs))
          .setEmoji(Emojis.slider)
          .setDisabled(!moderationData.status),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, 'moderationRules', 'button'))
          // .setLabel(`${moderationRules?.rules ? moderationRules.rules.length > 0 ? 'Edit' : 'Setup' : 'Setup'} moderation rule${moderationRules?.rules ? moderationRules.rules?.length > 1 ? 's' : '' : ' '}`)
          // .setStyle(SettingsUtils.generateStyle(moderationData.rules))
          // .setEmoji('🎛️')
          // .setDisabled(!moderationData.status)
          .setLabel('Setup rules (WIP)')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji(Emojis.development)
          .setDisabled(true)
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

    const links = [
      `[Logs](${Options.docsLink}/moderation/logs)`,
      `[Rules](${Options.docsLink}/moderation/rules)`,
      `[Cases](${Options.docsLink}/guide/user-punishments)`
    ].map(link => `${Emojis.point} ${link}`).join('\n')

    await Reply.reply({
      client,
      interaction: interaction,
      color: Colors.primary,
      author: 'Moderation settings',
      authorImage: client.user?.avatarURL(),
      description: `Must have moderation tools to automate server moderation. Checkout [moderation docs](${Options.docsLink}/moderation) for more information.\n${links}`,
      // fields: [
      //   {
      //     name: 'Moderation logs',
      //     value: 'Be notified about every action going on the server. Setup channel for logs and get very detailed informative message about actions.',
      //     inline: false
      //   },
      //   {
      //     name: 'Moderation rules',
      //     value: 'It is always great to automate moderation. Create fancy rules to automatically punish users after fixed amount of warnings.',
      //     inline: false
      //   },
      //   {
      //     name: 'Moderation cases',
      //     value: 'Start collecting data about moderation cases. Calculate statistics of punishments and save the data about cases and have ability to view and edit user\'s history of punishments.',
      //     inline: false
      //   }
      // ],
      components: actionRows,
      ephemeral: true,
    })
  }
}