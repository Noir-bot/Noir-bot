// import { GuildMember } from 'discord.js'
// import WelcomeCollection from '../../commands/slash/utilities/settings/collections/WelcomeCollection'
// import NoirClient from '../../structures/Client'
// import Event from '../../structures/Event'
// import UserUtils from './UserUtils'

// export default class UserJoin extends Event {
//   constructor(client: NoirClient) {
//     super(client, 'guildMemberRemove', false)
//   }

//   public async execute(client: NoirClient, member: GuildMember) {
//     const welcomeData = await WelcomeCollection.getData(client, member.guild.id)

//     if (!welcomeData.data.status) return
//     if (!welcomeData.data.webhook) return

//     const webhook = await welcomeData.getWebhook(client)

//     if (!webhook) return

//     if (welcomeData.data.messages.guild.status) {
//       const data = UserUtils.buildMessage(client, member, welcomeData.data.messages, 'guild_left')

//       if (data?.embeds) {
//         webhook.send({ embeds: data.embeds, content: data?.content })
//       } else {
//         webhook.send({ content: data?.content })
//       }
//     }
//   }
// }