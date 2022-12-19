// import { ActionRowBuilder, bold, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, inlineCode, MessageActionRowComponentBuilder, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'
// import Colors from '../../../../constants/Colors'
// import Options from '../../../../constants/Options'
// import NoirClient from '../../../../structures/Client'
// import ModerationCollection from '../../utilities/settings/collections/ModerationCollection'

// export default class WarnModify {
//   public static async removeResponse(client: NoirClient, interaction: ButtonInteraction, id: number) {
//     const caseData = await client.prisma.case.findFirst({
//       where: { guild: interaction.guildId!, caseId: id }
//     })

//     if (!caseData || !caseData.message) return

//     await client.prisma.case.deleteMany({
//       where: { guild: interaction.guildId!, caseId: id }
//     })

//     const webhook = await (await ModerationCollection.getData(client, interaction.guildId!)).getWebhook(client)

//     if (!webhook) return

//     const user = client.users.cache.get(caseData.user) ?? await client.users.fetch(caseData.user)
//     const mod = client.users.cache.get(caseData.moderator) ?? await client.users.fetch(caseData.moderator)

//     const buttons = [
//       new ButtonBuilder()
//         .setCustomId(`warn-${caseData.caseId}-remove`)
//         .setLabel('Remove warn')
//         .setDisabled(true)
//         .setStyle(ButtonStyle.Secondary),
//       new ButtonBuilder()
//         .setCustomId(`warn-${caseData.caseId}-edit`)
//         .setLabel('Edit warn')
//         .setDisabled(true)
//         .setStyle(ButtonStyle.Secondary)
//     ]

//     const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
//       .addComponents(buttons)

//     const embed = new EmbedBuilder()
//       .setColor(Colors.secondary)
//       .setAuthor({ name: 'Warning logs', iconURL: Options.clientAvatar })
//       .setFooter({ text: `Case ID: ${caseData.caseId}` })
//       .setDescription(
//         `${bold('User')}: ${user.username} ${inlineCode(user.id)}\n` +
//         `${bold('Moderator')}: ${mod.username} ${inlineCode(mod.id)}\n` +
//         `${caseData.reason ? `${bold('Reason')}: ${caseData.reason}\n` : ''}` +
//         `${bold('Warned')}: <t:${caseData.created.getTime().toString().slice(0, -3)}:R> <t:${caseData.created.getTime().toString().slice(0, -3)}:f>\n` +
//         `${caseData.edited ? `${bold('Edited')}: <t:${caseData.edited.getTime().toString().slice(0, -3)}:R> <t:${caseData.edited.getTime().toString().slice(0, -3)}:f>\n` : ''}` +
//         `${bold('Removed')}: <t:${new Date().getTime().toString().slice(0, -3)}:R> <t:${new Date().getTime().toString().slice(0, -3)}:f>`
//       )

//     await webhook.editMessage(caseData.message, {
//       embeds: [embed],
//       components: [actionRow]
//     })

//     await client.reply.reply({
//       interaction: interaction,
//       color: Colors.primary,
//       author: 'Successfully removed',
//       description: `#${caseData.caseId} case successfully removed`,
//       ephemeral: true,
//       update: false
//     })
//   }

//   public static async editRequest(client: NoirClient, interaction: ButtonInteraction, id: number) {
//     const caseData = await client.prisma.case.findFirst({
//       where: { guild: interaction.guildId!, caseId: id }
//     })

//     if (!caseData || !caseData.message) return

//     const reasonInput = new TextInputBuilder()
//       .setCustomId(`warn-${id}-reason`)
//       .setLabel('Reason')
//       .setPlaceholder('Enter the warn reason')
//       .setValue(caseData.reason ?? '')
//       .setStyle(TextInputStyle.Paragraph)
//       .setMaxLength(500)
//       .setRequired(true)

//     const actionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>()
//       .addComponents(reasonInput)
//     const modal = new ModalBuilder()
//       .setCustomId(`warn-${id}-edit`)
//       .setTitle('Edit warn')
//       .addComponents(actionRow)

//     await interaction.showModal(modal)
//   }

//   public static async editResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: number) {
//     let caseData = await client.prisma.case.findFirst({
//       where: { guild: interaction.guildId!, caseId: id }
//     })

//     if (!caseData || !caseData.message) return

//     const reason = interaction.fields.getTextInputValue(`warn-${id}-reason`)
//     const editDate = new Date()

//     await client.prisma.case.updateMany({
//       where: { guild: interaction.guildId!, caseId: id },
//       data: { reason: reason, edited: editDate }
//     })

//     const webhook = await (await ModerationCollection.getData(client, interaction.guildId!)).getWebhook(client)

//     if (!webhook) return

//     const user = client.users.cache.get(caseData.user) ?? await client.users.fetch(caseData.user)
//     const mod = client.users.cache.get(caseData.moderator) ?? await client.users.fetch(caseData.moderator)

//     const buttons = [
//       new ButtonBuilder()
//         .setCustomId(`warn-${caseData.caseId}-remove`)
//         .setLabel('Remove warn')
//         .setStyle(ButtonStyle.Secondary),
//       new ButtonBuilder()
//         .setCustomId(`warn-${caseData.caseId}-edit`)
//         .setLabel('Edit warn')
//         .setStyle(ButtonStyle.Secondary)
//     ]

//     const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
//       .addComponents(buttons)

//     const embed = new EmbedBuilder()
//       .setColor(Colors.secondary)
//       .setAuthor({ name: 'Warning logs', iconURL: Options.clientAvatar })
//       .setFooter({ text: `Case ID: ${caseData.caseId}` })
//       .setDescription(
//         `${bold('User')}: ${user.username} ${inlineCode(user.id)}\n` +
//         `${bold('Moderator')}: ${mod.username} ${inlineCode(mod.id)}\n` +
//         `${reason ? `${bold('Reason')}: ${reason}\n` : ''}` +
//         `${bold('Warned')}: <t:${caseData.created.getTime().toString().slice(0, -3)}:R> <t:${caseData.created.getTime().toString().slice(0, -3)}:f>\n` +
//         `${bold('Edited')}: <t:${editDate.getTime().toString().slice(0, -3)}:R> <t:${editDate.getTime().toString().slice(0, -3)}:f>`
//       )

//     await webhook.editMessage(caseData.message, {
//       embeds: [embed],
//       components: [actionRow]
//     })

//     await client.reply.reply({
//       interaction: interaction,
//       color: Colors.primary,
//       author: 'Successfully removed',
//       description: `#${caseData.caseId} case successfully removed`,
//       ephemeral: true,
//       update: false
//     })
//   }
// }