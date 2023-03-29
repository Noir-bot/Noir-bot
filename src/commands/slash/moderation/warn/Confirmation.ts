import WarnLogs from '@commands/slash/moderation/warn/Logs'
import Colors from '@constants/Colors'
import Emojis from '@constants/Emojis'
import Reply from '@helpers/Reply'
import Case from '@structures/Case'
import Client from '@structures/Client'
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, MessageActionRowComponentBuilder, User } from 'discord.js'
import WarnRule from './Rule'

export default class WarnConfirmation {
  public static async confirmationMessage(client: Client, interaction: ChatInputCommandInteraction | ButtonInteraction, user: User, reason: string) {
    const time = new Date()

    client.moderationCases.set(time.getTime().toString() + interaction.user.id, {
      guild: interaction.guildId!,
      user: user.id,
      moderator: interaction.user.id,
      reason: reason,
      action: 'warn',
      created: time,
      updated: time,
      resolved: false
    })

    setTimeout(() => {
      Reply.reply({
        client,
        interaction: interaction,
        color: Colors.primary,
        author: 'Warn Confirmation',
        description: 'Request timed out.',
        ephemeral: true
      })
      client.moderationCases.delete(time.getTime().toString() + interaction.user.id)
      return
    }, 30 * 1000)

    const buttons = [
      new ButtonBuilder()
        .setCustomId(`warn-confirm-${time.getTime() + interaction.user.id}`)
        .setLabel('Confirm')
        .setEmoji(Emojis.check)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`warn-cancel-${time.getTime() + interaction.user.id}`)
        .setLabel('Cancel')
        .setEmoji(Emojis.uncheck)
        .setStyle(ButtonStyle.Secondary)
    ]

    const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(buttons)

    Reply.reply({
      client,
      interaction: interaction,
      color: Colors.primary,
      author: 'Warn Confirmation',
      description: 'Are you sure you want to warn this user ?',
      footer: 'This request will time out in 30 seconds.',
      components: [actionRow],
      ephemeral: true
    })
  }

  public static handleButton(client: Client, interaction: ButtonInteraction) {
    const action = interaction.customId.split('-')[1]
    const caseId = interaction.customId.split('-')[2]

    if (action == 'cancel') {
      client.moderationCases.delete(caseId)
      WarnConfirmation.handleCancelation(client, interaction)
    }

    else if (action == 'confirm') [
      WarnConfirmation.handleConfirmation(client, interaction, client.moderationCases.get(caseId)!, caseId)
    ]
  }

  public static handleCancelation(client: Client, interaction: ButtonInteraction) {
    Reply.reply({
      client,
      interaction: interaction,
      color: Colors.success,
      author: 'Warn cancelation',
      description: 'Request successfully canceled.',
      ephemeral: true
    })
  }

  public static async handleConfirmation(client: Client, interaction: ButtonInteraction, data: Case, id: string) {
    await Reply.reply({
      client,
      interaction: interaction,
      color: Colors.success,
      author: 'Warn confirmation',
      description: 'Request successfully confirmed.',
      ephemeral: true
    })

    await WarnLogs.LogsMessage(client, interaction, data, id)
    await WarnRule.check(client, interaction.guildId!, data.user, id)
  }
}