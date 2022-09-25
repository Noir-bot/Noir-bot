import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, MessageActionRowComponentBuilder, ModalMessageModalSubmitInteraction } from 'discord.js'
import Colors from '../../../../../constants/Colors'
import Options from '../../../../../constants/Options'
import NoirClient from '../../../../../structures/Client'
import ModerationCollection from '../collections/ModerationCollection'

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
          .setCustomId(client.componentsUtils.generateId('settings', id, 'moderationLogs', 'button'))
          .setLabel('Setup logs')
          .setStyle(client.componentsUtils.generateStyle(moderationData?.data.logs.status)),
        new ButtonBuilder()
          .setCustomId(client.componentsUtils.generateId('settings', id, 'moderationRules', 'button'))
          .setLabel('Setup rules')
          .setStyle(client.componentsUtils.generateStyle(moderationData?.data.rules.status))
      ],
      [
        client.componentsUtils.generateBack('settings', id, 'moderationBack.settings'),
        client.componentsUtils.generateSave('settings', id, 'moderationSave'),
        client.componentsUtils.generateRestore('settings', id, 'moderationRestore')
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
      description: 'Must have moderation tools to automate moderation. Create rules and automatically punish rulebreakers with given statements. Be notified about all actions going on server with advanced loggings system.',
      components: actionRows,
      ephemeral: true,
    })
  }
}