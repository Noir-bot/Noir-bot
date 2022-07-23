import { WelcomeMessageData } from '@prisma/client'
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, MessageActionRowComponentBuilder, ModalMessageModalSubmitInteraction } from 'discord.js'
import Colors from '../../../../../constants/Colors'
import NoirClient from '../../../../../structures/Client'
import WelcomeSettings from '../collections/WelcomeSettings'
import SettingsCommandComponents from '../SettingsCommandComponents'
import SettingsCommandUtils from '../SettingsCommandUtils'
import Options from './../../../../../constants/Options'
export default class SettingsCommandWelcomeEditor {
  public static async initialMessage(client: NoirClient, interaction: ButtonInteraction | ModalMessageModalSubmitInteraction, id: string) {
    const welcomeData = client.welcomeSettings.get(id) as WelcomeSettings

    const buttons = [
      [
        new ButtonBuilder()
          .setCustomId(SettingsCommandUtils.generateComponentId(id, 'welcomeEditor*GuildStatus', 'button'))
          .setLabel(`${welcomeData?.data.messages?.guild?.status ? 'Disable' : 'Enable'} guild messages`)
          .setStyle(SettingsCommandUtils.generateButtonStyle(welcomeData.data.messages?.guild?.status))
          .setDisabled(!welcomeData?.data.status),
        new ButtonBuilder()
          .setCustomId(SettingsCommandUtils.generateComponentId(id, 'welcomeEditor.GuildJoin', 'button'))
          .setLabel('Edit guild join message')
          .setStyle(SettingsCommandComponents.defaultButtonStyle)
          .setDisabled(!welcomeData?.data.status || !welcomeData.data.messages?.guild?.status),
        new ButtonBuilder()
          .setCustomId(SettingsCommandUtils.generateComponentId(id, 'welcomeEditor.GuildLeft', 'button'))
          .setLabel('Edit guild left message')
          .setStyle(SettingsCommandComponents.defaultButtonStyle)
          .setDisabled(!welcomeData?.data.status || !welcomeData.data.messages?.guild?.status)
      ],
      [
        new ButtonBuilder()
          .setCustomId(SettingsCommandUtils.generateComponentId(id, 'welcomeEditor*DirectStatus', 'button'))
          .setLabel(`${welcomeData?.data.messages?.guild?.status ? 'Disable' : 'Enable'} direct messages`)
          .setStyle(SettingsCommandUtils.generateButtonStyle(welcomeData.data.messages?.direct?.status))
          .setDisabled(!welcomeData?.data.status),
        new ButtonBuilder()
          .setCustomId(SettingsCommandUtils.generateComponentId(id, 'welcomeEditor.DirectJoin', 'button'))
          .setLabel('Direct join message')
          .setStyle(SettingsCommandComponents.defaultButtonStyle)
          .setDisabled(!welcomeData?.data.status || !welcomeData.data.messages?.direct?.status)
      ],
      [
        SettingsCommandComponents.backButton(id, 'welcomeEditor'),
        SettingsCommandComponents.saveButton(id, 'welcomeEditor'),
        SettingsCommandComponents.resetButton(id, 'welcomeEditor')
      ]
    ]

    const actionRows = [
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[0]),
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[1]),
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[2])
    ]

    await client.reply.reply({
      interaction: interaction,
      color: Colors.primary,
      author: 'Welcome message editor',
      authorImage: Options.clientAvatar,
      description: 'Setup welcome messages. Choose what message to edit.',
      components: actionRows,
      ephemeral: true,
    })
  }

  public static async editorMessage(client: NoirClient, interaction: ButtonInteraction | ModalMessageModalSubmitInteraction, id: string, type: string) {
    const welcomeData = client.welcomeSettings.get(id)?.data
    let data: WelcomeMessageData

    if (!welcomeData) return

    if (type == 'GuildJoin') data = welcomeData.messages.guild.join
    else if (type == 'GuildLeft') data = welcomeData.messages.guild.leave
    else data = welcomeData.messages.direct.join

    const embedStatus = Boolean(data.embed.color) || Boolean(data.embed.description) || Boolean(data.embed.image) || Boolean(data.embed.thumbnail) || false
    const typeName = type == 'GuildJoin' ? 'Guild join' : type == 'GuildLeft' ? 'Guild left' : 'Direct join'

    const buttons = [
      [
        new ButtonBuilder()
          .setCustomId(SettingsCommandUtils.generateComponentId(id, `welcomeEditorEmbed:${type}`, 'button'))
          .setLabel('Embed settings')
          .setStyle(SettingsCommandUtils.generateButtonStyle(embedStatus)),
        new ButtonBuilder()
          .setCustomId(SettingsCommandUtils.generateComponentId(id, `welcomeEditorAuthor:${type}`, 'button'))
          .setLabel('Embed author')
          .setStyle(SettingsCommandUtils.generateButtonStyle(data.embed.author)),
        new ButtonBuilder()
          .setCustomId(SettingsCommandUtils.generateComponentId(id, `welcomeEditorTitle:${type}`, 'button'))
          .setLabel('Embed title')
          .setStyle(SettingsCommandUtils.generateButtonStyle(data.embed.title)),
        new ButtonBuilder()
          .setCustomId(SettingsCommandUtils.generateComponentId(id, `welcomeEditorFooter:${type}`, 'button'))
          .setLabel('Embed footer')
          .setStyle(SettingsCommandUtils.generateButtonStyle(data.embed.footer))
      ],
      [
        new ButtonBuilder()
          .setCustomId(SettingsCommandUtils.generateComponentId(id, `welcomeEditorAddField:${type}`, 'button'))
          .setLabel('Add embed field')
          .setStyle(SettingsCommandComponents.defaultButtonStyle)
          .setDisabled(!SettingsCommandUtils.getPremiumStatus(client, id) || data.embed.fields.length >= 25),
        new ButtonBuilder()
          .setCustomId(SettingsCommandUtils.generateComponentId(id, `welcomeEditor:RemoveField:${type}`, 'button'))
          .setLabel('Remove embed fields')
          .setStyle(SettingsCommandComponents.defaultButtonStyle)
          .setDisabled(!SettingsCommandUtils.getPremiumStatus(client, id) || data.embed.fields.length < 1),
        new ButtonBuilder()
          .setCustomId(SettingsCommandUtils.generateComponentId(id, `welcomeEditorFieldEditList:${type}`, 'button'))
          .setLabel('Edit embed fields')
          .setStyle(SettingsCommandComponents.defaultButtonStyle)
          .setDisabled(!SettingsCommandUtils.getPremiumStatus(client, id) || data.embed.fields.length < 1)
      ],
      [
        SettingsCommandComponents.backButton(id, 'welcomeEditorSelected'),
        SettingsCommandComponents.saveButton(id, 'welcomeEditorSelected', `.${type}`),
        SettingsCommandComponents.resetButton(id, 'welcomeEditorSelected', `.${type}`),
        SettingsCommandComponents.exampleButton(id, 'welcomeEditorSelected', `.${type}`)
      ]
    ]

    const actionRows = [
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[0]),
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[1]),
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[2])
    ]

    await client.reply.reply({
      interaction: interaction,
      color: Colors.primary,
      author: `${typeName} message editor`,
      authorImage: Options.clientAvatar,
      description: 'Setup message with our powerful editor.',
      components: actionRows,
      ephemeral: true,
    })
  }
}