import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, MessageActionRowComponentBuilder, User } from 'discord.js'
import Cases from '../../../../collections/Cases'
import Colors from '../../../../constants/Colors'
import NoirClient from '../../../../structures/Client'
import ModerationCollection from '../../utilities/settings/collections/ModerationCollection'

export default class WarnConfirmation {
  public static async confirmationMessage(client: NoirClient, interaction: ChatInputCommandInteraction, user: User, reason: string | null) {
    if (!interaction.guildId) return

    const casesData = await Cases.getData(client, interaction.guildId)
    const warnId = casesData.data.overall + 1

    const buttons = [
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId(`warn-${warnId}-${user.id}-cancel`)
        .setLabel('Cancel'),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setCustomId(`warn-${warnId}-${user.id}-confirm`)
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

  public static async buttonResponse(client: NoirClient, interaction: ButtonInteraction) {
    const parts = interaction.customId.split('-')
    const method = parts[3]
    const userId = parts[2]
    const id = parseInt(parts[1])

    if (method == 'cancel') {
      await client.reply.reply({
        interaction: interaction,
        color: Colors.warning,
        author: 'Warning cancel',
        description: `Action successfully canceled.`,
        ephemeral: true
      })
    }

    else if (method == 'confirm') {
      const moderationData = await ModerationCollection.getData(client, interaction.guildId!)

      if (moderationData.data.collectCases) {
        await client.prisma.case.create({
          data: {
            guild: interaction.guildId!,
            caseId: id,
            moderator: interaction.user.id,
            user: userId,
            type: 'warn',
            created: new Date()
          }
        })
      }

      const casesData = await Cases.getData(client, interaction.guildId!)
      casesData.data.overall += 1
      casesData.data.warning += 1
      casesData.saveData(client)

      await client.reply.reply({
        interaction: interaction,
        color: Colors.warning,
        author: 'Warning success',
        description: `User successfully warned`,
        ephemeral: true
      })
    }
  }
}