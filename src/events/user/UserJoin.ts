// import { ActionRowBuilder, ButtonBuilder, ButtonStyle, GuildMember, MessageActionRowComponentBuilder } from 'discord.js'
// import WelcomeCollection from '../../commands/slash/utilities/settings/collections/WelcomeCollection'
// import NoirClient from '../../structures/Client'
// import Event from '../../structures/Event'
// import UserUtils from './UserUtils'

// export default class UserJoin extends Event {
//   constructor(client: NoirClient) {
//     super(client, 'guildMemberAdd', false)
//   }

//   public async execute(client: NoirClient, member: GuildMember) {
//     const welcomeData = await WelcomeCollection.getData(client, member.guild.id)

//     if (welcomeData.data.roles) {
//       member.roles.add(welcomeData.data.roles)
//     }

//     if (!welcomeData.data.status) return
//     if (!welcomeData.data.webhook) return

//     const webhook = await welcomeData.getWebhook(client)

//     if (!webhook) return

//     if (welcomeData.data.messages.guild.status) {
//       const data = UserUtils.buildMessage(client, member, welcomeData.data.messages, 'guild_join')

//       if (data?.embeds) {
//         webhook.send({ embeds: data.embeds, content: data?.content })
//       } else {
//         webhook.send({ content: data?.content })
//       }
//     }

//     if (welcomeData.data.messages.direct.status) {
//       const data = UserUtils.buildMessage(client, member, welcomeData.data.messages, 'direct_join')

//       const button = new ButtonBuilder().setCustomId(`sentFrom-${member.guild.id}`).setLabel(`Sent from ${member.guild.name}`).setDisabled(true).setStyle(ButtonStyle.Secondary)
//       const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([button])

//       try {
//         if (data?.embeds) {
//           await member.send({ embeds: data.embeds, content: data?.content, components: [actionRow] })
//         } else {
//           await member.send({ content: data?.content, components: [actionRow] })
//         }
//       } catch { }
//     }
//   }
// }