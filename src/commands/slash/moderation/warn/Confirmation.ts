import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, MessageActionRowComponentBuilder, User } from 'discord.js'
import Colors from '../../../../constants/Colors'
import Case from '../../../../structures/Case'
import NoirClient from '../../../../structures/Client'
import WarnLogs from './Logs'

export default class WarnConfirmation {
  public static async confirmationMessage(client: NoirClient, interaction: ChatInputCommandInteraction | ButtonInteraction, user: User, reason: string) {
    const time = new Date()

    client.cases.set(time.getTime().toString() + interaction.user.id, {
      guild: interaction.guildId!,
      user: user.id,
      mod: interaction.user.id,
      reason: reason,
      action: 'warn',
      created: time,
      updated: time
    })

    setTimeout(() => {
      client.reply.reply({
        interaction: interaction,
        color: Colors.warning,
        author: 'Warn Confirmation',
        description: 'Request timed out.',
        ephemeral: true
      })
      client.cases.delete(time.getTime().toString() + interaction.user.id)
      return
    }, 30 * 1000)

    const buttons = [
      new ButtonBuilder().setCustomId(`warn-confirm-${time.getTime() + interaction.user.id}`).setLabel('Confirm').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`warn-cancel-${time.getTime() + interaction.user.id}`).setLabel('Cancel').setStyle(ButtonStyle.Secondary)
    ]

    const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(buttons)

    client.reply.reply({
      interaction: interaction,
      color: Colors.primary,
      author: 'Warn Confirmation',
      description: 'Are you sure you want to warn this user ?',
      footer: 'This request will time out in 30 seconds.',
      components: [actionRow],
      ephemeral: true
    })
  }

  public static handleButton(client: NoirClient, interaction: ButtonInteraction) {
    const action = interaction.customId.split('-')[1]
    const caseId = interaction.customId.split('-')[2]

    if (action == 'cancel') {
      client.cases.delete(caseId)
      WarnConfirmation.handleCancelation(client, interaction)
    }

    else if (action == 'confirm') [
      WarnConfirmation.handleConfirmation(client, interaction, client.cases.get(caseId)!, caseId)
    ]
  }

  public static handleCancelation(client: NoirClient, interaction: ButtonInteraction) {
    client.reply.reply({
      interaction: interaction,
      color: Colors.primary,
      author: 'Warn cancelation',
      description: 'Request successfully canceled.',
      ephemeral: true
    })
  }

  public static async handleConfirmation(client: NoirClient, interaction: ButtonInteraction, data: Case, id: string) {
    await client.reply.reply({
      interaction: interaction,
      color: Colors.primary,
      author: 'Warn confirmation',
      description: 'Request successfully confirmed.',
      ephemeral: true
    })

    WarnLogs.LogsMessage(client, interaction, data, id)
  }
}