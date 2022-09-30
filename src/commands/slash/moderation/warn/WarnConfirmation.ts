import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, MessageActionRowComponentBuilder, User } from 'discord.js'
import Case from '../../../../collections/Case'
import Cases from '../../../../collections/Cases'
import Colors from '../../../../constants/Colors'
import NoirClient from '../../../../structures/Client'
import ModerationCollection from '../../utilities/settings/collections/ModerationCollection'
import WarnMessage from './WarnMessage'

export default class WarnConfirmation {
  public static async confirmationMessage(client: NoirClient, interaction: ChatInputCommandInteraction, user: User, reason: string | null) {
    if (!interaction.guildId) return

    const casesData = await Cases.getData(client, interaction.guildId)
    const id = casesData.data.overall + 1

    client.case.set(id, new Case(id, {
      caseId: id,
      type: 'warn',
      guild: interaction.guildId!,
      moderator: interaction.user.id,
      user: user.id,
      created: new Date(),
      reason: reason ?? undefined
    }))

    const buttons = [
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId(`warn-${id}-cancel`)
        .setLabel('Cancel'),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setCustomId(`warn-${id}-confirm`)
        .setLabel('Confirm'),
    ]

    const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(buttons)

    await client.reply.reply({
      interaction: interaction,
      color: Colors.secondary,
      author: 'Confirmation',
      description: `Are you sure you want to warn ${user.username}`,
      components: [actionRow],
      ephemeral: true
    })
  }

  public static async cancelResponse(client: NoirClient, interaction: ButtonInteraction) {
    await client.reply.reply({
      interaction: interaction,
      color: Colors.warning,
      author: 'Warning cancel',
      description: `Action successfully canceled.`,
      ephemeral: true
    })
  }

  public static async confirmResponse(client: NoirClient, interaction: ButtonInteraction, id: number) {
    const moderationData = await ModerationCollection.getData(client, interaction.guildId!)
    const caseData = client.case.get(id)

    if (!caseData) return
    const casesData = await Cases.getData(client, interaction.guildId!)
    casesData.data.overall += 1
    casesData.data.warning += 1
    casesData.saveData(client)

    const webhook = await moderationData.getWebhook(client)

    if (moderationData.data.logs.status && webhook) {
      const message = await WarnMessage.sendLogsMessage(client, caseData, webhook)
      caseData.data.message = message.id
    }

    if (moderationData.data.collectCases) {
      await client.prisma.case.create({
        data: {
          guild: caseData.data.guild,
          caseId: caseData.data.caseId,
          moderator: caseData.data.moderator,
          user: caseData.data.user,
          type: caseData.data.type,
          created: caseData.data.created,
          reason: caseData.data.reason,
          message: caseData.data.message,
          edited: caseData.data.edited
        }
      })
    }

    client.case.delete(id)

    await client.reply.reply({
      interaction: interaction,
      color: Colors.warning,
      author: 'Warning success',
      description: `User successfully warned`,
      ephemeral: true
    })
  }
}