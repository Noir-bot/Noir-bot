// import { ActionRowBuilder, bold, ButtonBuilder, ButtonStyle, EmbedBuilder, inlineCode, MessageActionRowComponentBuilder, Webhook } from 'discord.js'
// import Case from '../../../../collections/Case'
// import Colors from '../../../../constants/Colors'
// import Options from '../../../../constants/Options'
// import NoirClient from '../../../../structures/Client'

// export default class WarnMessage {
//   public static async sendLogsMessage(client: NoirClient, caseData: Case, webhook: Webhook) {
//     const user = client.users.cache.get(caseData.data.user) ?? await client.users.fetch(caseData.data.user)
//     const mod = client.users.cache.get(caseData.data.moderator) ?? await client.users.fetch(caseData.data.moderator)

//     const buttons = [
//       new ButtonBuilder()
//         .setCustomId(`warn-${caseData.id}-remove`)
//         .setLabel('Remove warn')
//         .setStyle(ButtonStyle.Secondary),
//       new ButtonBuilder()
//         .setCustomId(`warn-${caseData.id}-edit`)
//         .setLabel('Edit warn')
//         .setStyle(ButtonStyle.Secondary)
//     ]

//     const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
//       .addComponents(buttons)

//     const embed = new EmbedBuilder()
//       .setColor(Colors.secondary)
//       .setAuthor({ name: 'Warning logs', iconURL: Options.clientAvatar })
//       .setFooter({ text: `Case ID: ${caseData.id}` })
//       .setDescription(
//         `${bold('User')}: ${user.username} ${inlineCode(user.id)}\n` +
//         `${bold('Moderator')}: ${mod.username} ${inlineCode(mod.id)}\n` +
//         `${caseData.data.reason ? `${bold('Reason')}: ${caseData.data.reason}\n` : ''}` +
//         `${bold('Warned')}: <t:${caseData.data.created.getTime().toString().slice(0, -3)}:R> <t:${caseData.data.created.getTime().toString().slice(0, -3)}:f>`
//       )

//     return webhook.send({
//       embeds: [embed],
//       components: [actionRow]
//     })
//   }
// }