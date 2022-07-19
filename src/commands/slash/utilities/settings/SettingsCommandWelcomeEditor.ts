// export default class SettingsCommandWelcomeEditor {
//   public static async messagesMessage(client: NoirClient, interaction: ButtonInteraction | ModalMessageModalSubmitInteraction, id: string) {
//     const welcomeData = client.welcomeSettings.get(id) as WelcomeSettings

//     const buttons = [
//       [
//         new ButtonBuilder()
//           .setCustomId(SettingsUtils.generateComponentId(id, 'welcomeMessagesEditorGuildStatus', 'button'))
//           .setLabel(`${welcomeData?.data.messages?.guild?.status ? 'Disable' : 'Enable'} guild messages`)
//           .setStyle(SettingsUtils.generateButtonStyle(welcomeData.data.messages?.guild?.status))
//           .setDisabled(!welcomeData?.data.status),
//         new ButtonBuilder()
//           .setCustomId(SettingsUtils.generateComponentId(id, 'welcomeMessagesEditorEditor.GuildJoin', 'button'))
//           .setLabel('Edit guild join message')
//           .setStyle(SettingsComponents.defaultButtonStyle)
//           .setDisabled(!welcomeData?.data.status || !welcomeData.data.messages?.guild?.status),
//         new ButtonBuilder()
//           .setCustomId(SettingsUtils.generateComponentId(id, 'welcomeMessagesEditorEditor.GuildLeft', 'button'))
//           .setLabel('Edit guild left message')
//           .setStyle(SettingsComponents.defaultButtonStyle)
//           .setDisabled(!welcomeData?.data.status || !welcomeData.data.messages?.guild?.status)
//       ],
//       [
//         new ButtonBuilder()
//           .setCustomId(SettingsUtils.generateComponentId(id, 'welcomeMessagesEditorDirectStatus', 'button'))
//           .setLabel(`${welcomeData?.data.messages?.guild?.status ? 'Disable' : 'Enable'} direct messages`)
//           .setStyle(SettingsUtils.generateButtonStyle(welcomeData.data.messages?.direct?.status))
//           .setDisabled(!welcomeData?.data.status),
//         new ButtonBuilder()
//           .setCustomId(SettingsUtils.generateComponentId(id, 'welcomeMessagesEditorEditor.DirectJoin', 'button'))
//           .setLabel('Direct join message')
//           .setStyle(SettingsComponents.defaultButtonStyle)
//           .setDisabled(!welcomeData?.data.status || !welcomeData.data.messages?.direct?.status)
//       ],
//       [
//         SettingsComponents.backButton(id, 'welcomeMessagesEditor'),
//         SettingsComponents.saveButton(id, 'welcomeMessagesEditor'),
//         SettingsComponents.resetButton(id, 'welcomeMessagesEditor')
//       ]
//     ]

//     const actionRows = [
//       new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[0]),
//       new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[1]),
//       new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[2])
//     ]

//     await client.reply.reply({
//       interaction: interaction,
//       color: Colors.primary,
//       author: 'Welcome message editor',
//       authorImage: Options.clientAvatar,
//       description: 'Setup welcome messages. Choose what message to edit.',
//       components: actionRows,
//       ephemeral: true,
//     })
//   }

//   public static async messageEditorMessage(client: NoirClient, interaction: ButtonInteraction | ModalMessageModalSubmitInteraction, id: string, type: string) {
//     const welcomeData = client.welcomeSettings.get(id)!.data
//     let data

//     if (type == 'GuildJoin') data = welcomeData.messages.guild.join
//     else if (type == 'GuildLeft') data = welcomeData.messages.guild.leave
//     else data = welcomeData.messages.direct.join

//     const embedStatus = Boolean(data.embed.color) || Boolean(data.embed.description) || Boolean(data.embed.image) || Boolean(data.embed.thumbnail) || false

//     const buttons = [
//       [
//         new ButtonBuilder()
//           .setCustomId(SettingsUtils.generateComponentId(id, `welcomeMessagesEditorEmbed.${type}`, 'button'))
//           .setLabel('Embed settings')
//           .setStyle(SettingsUtils.generateButtonStyle(embedStatus)),
//         new ButtonBuilder()
//           .setCustomId(SettingsUtils.generateComponentId(id, `welcomeMessagesEditorAuthor.${type}`, 'button'))
//           .setLabel('Embed author')
//           .setStyle(SettingsUtils.generateButtonStyle(data.embed.author)),
//         new ButtonBuilder()
//           .setCustomId(SettingsUtils.generateComponentId(id, `welcomeMessagesEditorTitle.${type}`, 'button'))
//           .setLabel('Embed title')
//           .setStyle(SettingsUtils.generateButtonStyle(data.embed.title)),
//         new ButtonBuilder()
//           .setCustomId(SettingsUtils.generateComponentId(id, `welcomeMessagesEditorFooter.${type}`, 'button'))
//           .setLabel('Embed footer')
//           .setStyle(SettingsUtils.generateButtonStyle(data.embed.footer))
//       ],
//       [
//         new ButtonBuilder()
//           .setCustomId(SettingsUtils.generateComponentId(id, `welcomeMessagesEditorAddField.${type}`, 'button'))
//           .setLabel('Add embed field')
//           .setStyle(SettingsComponents.defaultButtonStyle)
//           .setDisabled(!SettingsUtils.getPremiumStatus(client, id) || data.embed.fields.length >= 25),
//         new ButtonBuilder()
//           .setCustomId(SettingsUtils.generateComponentId(id, `welcomeMessagesEditorRemoveField.${type}`, 'button'))
//           .setLabel('Remove embed fields')
//           .setStyle(SettingsComponents.defaultButtonStyle)
//           .setDisabled(!SettingsUtils.getPremiumStatus(client, id) || data.embed.fields.length < 1),
//         new ButtonBuilder()
//           .setCustomId(SettingsUtils.generateComponentId(id, `welcomeMessagesEditorFieldEditList.${type}`, 'button'))
//           .setLabel('Edit embed fields')
//           .setStyle(SettingsComponents.defaultButtonStyle)
//           .setDisabled(!SettingsUtils.getPremiumStatus(client, id) || data.embed.fields.length < 1)
//       ],
//       [
//         SettingsComponents.backButton(id, 'welcomeMessagesEditor', type),
//         SettingsComponents.saveButton(id, 'welcomeMessagesEditor', type),
//         SettingsComponents.resetButton(id, 'welcomeMessagesEditor', type),
//         SettingsComponents.exampleButton(id, 'welcomeMessagesEditor', type)
//       ]
//     ]

//     const actionRows = [
//       new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[0]),
//       new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[1]),
//       new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[2])
//     ]

//     await client.reply.reply({
//       interaction: interaction,
//       color: Colors.primary,
//       author: 'Welcome message editor',
//       authorImage: Options.clientAvatar,
//       description: 'Setup welcome message with our powerful editor. Add fields and images as you want.',
//       components: actionRows,
//       ephemeral: true,
//     })
//   }
// }