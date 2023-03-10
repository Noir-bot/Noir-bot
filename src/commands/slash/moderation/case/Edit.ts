import WarnLogs from '@commands/slash/moderation/warn/Logs'
import Colors from '@constants/Colors'
import Reply from '@helpers/Reply'
import Client from '@structures/Client'
import { ActionRowBuilder, ChatInputCommandInteraction, ModalActionRowComponentBuilder, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'

export default class CaseEdit {
  public static async edit(client: Client, interaction: ChatInputCommandInteraction, id: number) {
    const caseData = await client.prisma.case.findFirst({ where: { id } })

    if (!caseData) {
      Reply.reply({
        client,
        interaction: interaction,
        color: Colors.warning,
        author: 'Case error',
        description: 'This case does not exist.',
        ephemeral: true
      })

      return
    }

    const input = new TextInputBuilder()
      .setLabel('New reason')
      .setValue(caseData.reason || 'No reason provided')
      .setStyle(TextInputStyle.Short)
      .setCustomId('reason')
      .setMaxLength(500)
      .setRequired(true)
      .setMinLength(1)

    const actionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>()
      .addComponents(input)

    const modal = new ModalBuilder()
      .addComponents(actionRow)
      .setCustomId(`case-edit-${caseData.id}`)
      .setTitle('Edit reason')

    interaction.showModal(modal)
  }

  public static async modalResponse(client: Client, interaction: ModalSubmitInteraction) {
    const reason = interaction.fields.getTextInputValue('reason')

    if (!reason) return

    const caseData = await client.prisma.case.update({
      where: { id: parseInt(interaction.customId.split('-')[2]) },
      data: { reason: reason, updated: new Date() }
    })

    Reply.reply({
      client,
      interaction: interaction,
      color: Colors.primary,
      author: 'Case updated',
      description: 'Case was successfully updated.',
      ephemeral: true
    })

    if (caseData.action == 'warn') {
      WarnLogs.UpdateLogs(client, interaction, caseData)
    }
  }
}