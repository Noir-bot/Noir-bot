import { ActionRowBuilder, bold, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, inlineCode, MessageActionRowComponentBuilder } from 'discord.js'
import Colors from '../../../../constants/Colors'
import Options from '../../../../constants/Options'
import NoirClient from '../../../../structures/Client'
export default class WarnModify {
  public static async removeResponse(client: NoirClient, interaction: ButtonInteraction, id: number) {
    const caseData = await client.prisma.case.findFirst({
      where: { guild: interaction.guildId!, caseId: id }
    })

    if (!caseData || !caseData.message) return

    await client.prisma.case.deleteMany({
      where: { guild: interaction.guildId!, caseId: id }
    })

    const webhook = await client.moderationSettings.get(interaction.guildId!)?.getWebhook(client)

    if (!webhook) return

    const user = client.users.cache.get(caseData.user) ?? await client.users.fetch(caseData.user)
    const mod = client.users.cache.get(caseData.moderator) ?? await client.users.fetch(caseData.moderator)

    const buttons = [
      new ButtonBuilder()
        .setCustomId(`warn-${caseData.id}-remove`)
        .setLabel('Remove warn')
        .setDisabled(true)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`warn-${caseData.id}-edit`)
        .setLabel('Edit warn')
        .setDisabled(true)
        .setStyle(ButtonStyle.Secondary)
    ]

    const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(buttons)

    const embed = new EmbedBuilder()
      .setColor(Colors.secondary)
      .setAuthor({ name: 'Warning logs', iconURL: Options.clientAvatar })
      .setFooter({ text: `Case ID: ${caseData.caseId}` })
      .setDescription(
        `${bold('User')}: ${user.username} ${inlineCode(user.id)}\n` +
        `${bold('Moderator')}: ${mod.username} ${inlineCode(mod.id)}\n` +
        `${caseData.reason ? `${bold('Reason')}: ${caseData.reason}\n` : ''}` +
        `${bold('Warned')}: <t:${caseData.created.getTime().toString().slice(0, -3)}:R> <t:${caseData.created.getTime().toString().slice(0, -3)}:f>\n` +
        `${bold('Removed')}: <t:${new Date().getTime().toString().slice(0, -3)}:R> <t:${new Date().getTime().toString().slice(0, -3)}:f>`
      )

    await webhook.editMessage(caseData.message, {
      embeds: [embed],
      components: [actionRow]
    })

    await client.reply.reply({
      interaction: interaction,
      color: Colors.primary,
      author: 'Successfully removed',
      description: `#${caseData.caseId} case successfully removed`,
      ephemeral: true,
      update: false
    })
  }
}