import SettingsUtils from '@commands/slash/utilities/settings/SettingsUtils'
import WelcomeEditorAuthor from '@commands/slash/utilities/settings/welcome/editor/WelcomeEditorAuthor'
import WelcomeEditorEmbed from '@commands/slash/utilities/settings/welcome/editor/WelcomeEditorEmbed'
import WelcomeEditorFooter from '@commands/slash/utilities/settings/welcome/editor/WelcomeEditorFooter'
import WelcomeEditorMessage from '@commands/slash/utilities/settings/welcome/editor/WelcomeEditorMessage'
import WelcomeEditorTitle from '@commands/slash/utilities/settings/welcome/editor/WelcomeEditorTitle'
import WelcomeEditorAddField from '@commands/slash/utilities/settings/welcome/editor/fields/WelcomeEditorAddField'
import WelcomeEditorEditField from '@commands/slash/utilities/settings/welcome/editor/fields/WelcomeEditorEditField'
import WelcomeEditorRemoveField from '@commands/slash/utilities/settings/welcome/editor/fields/WelcomeEditorRemoveField'
import Colors from '@constants/Colors'
import Emojis from '@constants/Emojis'
import Reply from '@helpers/Reply'
import Client from '@structures/Client'
import Premium from '@structures/Premium'
import Save from '@structures/Save'
import WelcomeMessage, { WelcomeMessageType } from '@structures/welcome/WelcomeMessage'
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ColorResolvable, MessageActionRowComponentBuilder, ModalMessageModalSubmitInteraction, StringSelectMenuBuilder, StringSelectMenuInteraction, time } from 'discord.js'
import Preferences from '../../../../../../constants/Preferences'

export default class WelcomeEditor {
  public static async initialMessage(client: Client, interaction: ButtonInteraction<'cached'> | ModalMessageModalSubmitInteraction<'cached'> | StringSelectMenuInteraction<'cached'>, id: string, type: WelcomeMessageType = 'guild_join') {
    const messageData = await WelcomeMessage.cache(client, id, type, false, true)
    const premiumData = await Premium.cache(client, id)
    const embedStatus = messageData?.color ?? messageData?.description ?? messageData?.image ?? messageData?.thumbnail ?? messageData?.timestamp
    const exampleStatus = messageData?.description || messageData?.image || messageData?.thumbnail || messageData?.author || messageData?.authorImage || messageData?.footer || messageData?.title || messageData.fieldsId || messageData.message

    const buttons = [
      [
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, `welcomeEditorEmbed.${type}`, 'button'))
          .setLabel('Embed settings')
          .setStyle(SettingsUtils.generateStyle(embedStatus))
          .setDisabled(!messageData.status),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, `welcomeEditorAuthor.${type}`, 'button'))
          .setLabel('Embed author')
          .setStyle(SettingsUtils.generateStyle(messageData?.author || messageData?.authorImage))
          .setDisabled(!messageData.status),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, `welcomeEditorTitle.${type}`, 'button'))
          .setLabel('Embed title')
          .setStyle(SettingsUtils.generateStyle(messageData?.title || messageData?.url))
          .setDisabled(!messageData.status),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, `welcomeEditorFooter.${type}`, 'button'))
          .setLabel('Embed footer')
          .setStyle(SettingsUtils.generateStyle(messageData?.footer || messageData?.footerImage))
          .setDisabled(!messageData.status),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, `welcomeEditorMessage.${type}`, 'button'))
          .setLabel(`${messageData?.message ? 'Edit' : 'Add'} message content`)
          .setStyle(SettingsUtils.generateStyle(messageData?.message))
          .setDisabled(!messageData.status)
      ],
      [
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, `welcomeEditorAddField.${type}`, 'button'))
          .setLabel('Add embed field')
          .setStyle(SettingsUtils.defaultStyle)
          .setDisabled(!messageData.status || messageData.fieldsId.length >= 25 || !premiumData?.status())
          .setEmoji(Preferences.premiumEmoji),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, `welcomeEditorEditField.${type}`, 'button'))
          .setLabel('Edit embed fields')
          .setStyle(SettingsUtils.defaultStyle)
          .setDisabled(!messageData.status || messageData.fieldsId.length == 0 || !premiumData?.status())
          .setEmoji(Preferences.premiumEmoji),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, `welcomeEditorRemoveField.${type}`, 'button'))
          .setLabel('Remove embed fields')
          .setStyle(SettingsUtils.defaultStyle)
          .setDisabled(!messageData.status || messageData?.fieldsId.length == 0)
      ],
      [
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, `welcomeEditorStatus.${type}`, 'button'))
          .setLabel(`${messageData.status ? 'Disable' : 'Enable'} auto message`)
          .setStyle(SettingsUtils.generateStyle(messageData.status))
          .setEmoji(`${messageData.status ? Emojis.enable : Emojis.disable}`),
        SettingsUtils.generateExample('settings', id, `welcomeExample.welcomeEditor.${type}`, !messageData.status || !exampleStatus),
        SettingsUtils.generateReset('settings', id, `welcomeReset.welcomeEditor.${type}`)
      ],
      [
        SettingsUtils.generateBack('settings', id, 'welcome'),
        SettingsUtils.generateSave('settings', id, `welcomeSave.welcomeEditor.${type}`, client, interaction.guildId, 'welcome'),
        SettingsUtils.generateRestore('settings', id, `welcomeRestore.welcomeEditor.${type}`)
      ]
    ]

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeEditor', 'select'))
      .setPlaceholder('Choose message type')
      .setMaxValues(1)
      .setMinValues(1)
      .setOptions(
        {
          label: 'Guild join',
          description: 'Guild join message type',
          value: 'guild_join',
          emoji: Emojis.openDoor,
          default: type == 'guild_join'
        },
        {
          label: 'Guild left',
          description: 'Guild left message type',
          emoji: Emojis.closeDoor,
          value: 'guild_left',
          default: type == 'guild_left'
        },
        {
          label: 'Direct join',
          description: 'Direct join',
          emoji: Emojis.direct,
          value: 'direct_join',
          default: type == 'direct_join'
        }
      )

    const actionRows = [
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(selectMenu),
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[0]),
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[1]),
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[2]),
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[3])
    ]

    await Reply.reply({
      client,
      interaction: interaction,
      color: Colors.primary,
      author: 'Message editor',
      authorImage: client.user?.avatarURL(),
      description: 'Choose message type and setup with advanced message editor.',
      components: actionRows,
      fields: [
        {
          name: 'Premium features',
          value: `Premium features are indicated with this emoji ${Preferences.premiumEmoji}`,
          inline: false
        }
      ],
      ephemeral: true,
      fetch: true
    })
  }

  public static async exampleResponse(client: Client, interaction: ButtonInteraction<'cached'>, id: string, type: WelcomeMessageType) {
    const messageData = await WelcomeMessage.cache(client, id, type, false, true)
    const button = SettingsUtils.generateBack('settings', id, `welcomeBack.welcomeEditor.${type}`)
    const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(button)
    const exampleStatus = messageData?.description || messageData?.image || messageData?.thumbnail || messageData?.author || messageData?.authorImage || messageData?.footer || messageData?.title || messageData.fieldsId || messageData.message

    if (!exampleStatus) {
      await Reply.reply({
        client,
        interaction: interaction,
        color: Colors.warning,
        author: 'Message error',
        description: 'Message object is empty, setup message before testing.',
        components: [actionRow]
      })
    }

    else {
      const variables = { guild: { name: interaction.guild?.name, icon: interaction.guild?.iconURL(), members: interaction.guild?.memberCount, createdAt: time(interaction.guild.createdTimestamp, 'd'), created: time(interaction.guild.createdTimestamp, 'R') }, user: { name: interaction.user.username, avatar: interaction.user.avatarURL(), createdAt: time(interaction.user.createdTimestamp, 'd'), created: time(interaction.user.createdTimestamp, 'R'), joinedAt: 'Unspecified', joined: 'Unspecified' }, client: { name: client.user?.username, avatar: client.user?.avatarURL() } }

      if (interaction.member.joinedTimestamp) {
        variables.user.joinedAt = time(interaction.member.joinedTimestamp, 'd')
        variables.user.joined = time(interaction.member.joinedTimestamp, 'R')
      }

      try {
        await Reply.reply({
          client,
          interaction: interaction,
          color: messageData.color as ColorResolvable ?? 'Default',
          author: WelcomeMessage.formatVariable(messageData.author, variables) ?? undefined,
          title: WelcomeMessage.formatVariable(messageData.title, variables) ?? undefined,
          url: WelcomeMessage.formatVariable(messageData.url, variables) ?? undefined,
          authorImage: messageData.authorImage ?? WelcomeMessage.formatVariable(messageData.rawAuthorImage, variables) ?? undefined,
          content: WelcomeMessage.formatVariable(messageData.message, variables) ?? undefined,
          description: WelcomeMessage.formatVariable(messageData.description, variables) ?? undefined,
          fields: messageData.fieldsId.map(id => {
            return {
              name: WelcomeMessage.formatVariable(messageData?.fieldsName[id], variables) ?? messageData?.fieldsName[id],
              value: WelcomeMessage.formatVariable(messageData?.fieldsValue[id], variables) ?? messageData?.fieldsValue[id],
              inline: messageData?.fieldsInline[id]
            }
          }) ?? [],
          footer: WelcomeMessage.formatVariable(messageData.footer, variables) ?? undefined,
          footerImage: messageData.footerImage ?? WelcomeMessage.formatVariable(messageData.rawFooterImage, variables) ?? undefined,
          image: messageData.image ?? WelcomeMessage.formatVariable(messageData.rawImage, variables) ?? undefined,
          thumbnail: messageData.thumbnail ?? WelcomeMessage.formatVariable(messageData.rawThumbnail, variables) ?? undefined,
          components: [actionRow],
        })
      } catch (error) {
        await Reply.reply({
          client,
          interaction: interaction,
          color: Colors.warning,
          author: 'Message error',
          description: 'Message object is empty, setup message before testing.',
          components: [actionRow]
        })

        console.log(error)
      }
    }
  }

  public static async resetRequest(client: Client, interaction: ButtonInteraction<'cached'>, id: string, type: WelcomeMessageType) {
    await WelcomeMessage.cache(client, id, type, false, true)

    const buttons = [
      new ButtonBuilder()
        .setCustomId(SettingsUtils.generateId('settings', id, `welcomeReset.a.${type}.cancel`, 'button'))
        .setLabel('Cancel')
        .setStyle(SettingsUtils.defaultStyle),
      new ButtonBuilder()
        .setCustomId(SettingsUtils.generateId('settings', id, `welcomeReset.a.${type}.confirm`, 'button'))
        .setLabel('Confirm')
        .setStyle(SettingsUtils.warningStyle),
    ]

    const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons)

    await Reply.reply({
      client,
      interaction: interaction,
      color: Colors.warning,
      authorImage: client.user?.avatarURL(),
      author: 'Reset confirmation',
      description: 'Are you sure you want to reset all message data. This won\'t affect saved data.',
      components: [actionRow]
    })
  }

  public static async resetResponse(client: Client, interaction: ButtonInteraction<'cached'>, id: string, type: WelcomeMessageType) {
    const messageData = await WelcomeMessage.cache(client, id, type, false, true)

    messageData.author = undefined
    messageData.authorImage = undefined
    messageData.color = undefined
    messageData.description = undefined
    messageData.fieldsId = []
    messageData.fieldsInline = []
    messageData.fieldsName = []
    messageData.fieldsValue = []
    messageData.footer = undefined
    messageData.footerImage = undefined
    messageData.image = undefined
    messageData.message = undefined
    messageData.rawAuthorImage = undefined
    messageData.rawColor = undefined
    messageData.rawFooterImage = undefined
    messageData.rawImage = undefined
    messageData.rawThumbnail = undefined
    messageData.status = false
    messageData.thumbnail = undefined
    messageData.timestamp = false
    messageData.title = undefined
    messageData.url = undefined

    this.initialMessage(client, interaction, id, type)
  }

  public static async buttonResponse(client: Client, interaction: ButtonInteraction<'cached'>, id: string, method: string) {
    const messageType = method.split('.')[1] as WelcomeMessageType
    const action = method.split('.')[0]

    if (method == 'welcomeEditor') {
      await this.initialMessage(client, interaction, id, messageType)
    }

    else if (action == 'welcomeEditorStatus') {
      const messageData = await WelcomeMessage.cache(client, id, messageType, false, true)

      messageData.status = !messageData.status
      const saves = Save.cache(client, `${interaction.guildId}-welcome`)
      saves.count += 1

      await WelcomeEditor.initialMessage(client, interaction, id, messageType)
    }

    else if (action == 'welcomeEditorMessage') {
      await WelcomeEditorMessage.request(client, interaction, id, messageType)
    }

    else if (action == 'welcomeEditorEmbed') {
      await WelcomeEditorEmbed.request(client, interaction, id, messageType)
    }

    else if (action == 'welcomeEditorAuthor') {
      await WelcomeEditorAuthor.request(client, interaction, id, messageType)
    }

    else if (action == 'welcomeEditorTitle') {
      await WelcomeEditorTitle.request(client, interaction, id, messageType)
    }

    else if (action == 'welcomeEditorFooter') {
      await WelcomeEditorFooter.request(client, interaction, id, messageType)
    }

    else if (action == 'welcomeEditorAddField') {
      await WelcomeEditorAddField.request(client, interaction, id, messageType)
    }

    else if (action == 'welcomeEditorRemoveField') {
      await WelcomeEditorRemoveField.request(client, interaction, id, messageType)
    }

    else if (action == 'welcomeEditorEditField') {
      await WelcomeEditorEditField.listRequest(client, interaction, id, messageType)
    }
  }

  public static async selectResponse(client: Client, interaction: StringSelectMenuInteraction<'cached'>, id: string, method: string) {
    const messageType = method.split('.')[1] as WelcomeMessageType

    if (method.startsWith('welcomeEditorRemoveField')) {
      await WelcomeEditorRemoveField.response(client, interaction, id, messageType)
    }

    else if (method.startsWith('welcomeEditorEditField')) {
      const fieldId = parseInt(interaction.values[0])
      await WelcomeEditorEditField.request(client, interaction, id, messageType, fieldId)
    }

    else if (method.startsWith('welcomeEditor')) {
      const messageType = interaction.values[0] as WelcomeMessageType

      await this.initialMessage(client, interaction, id, messageType)
    }
  }

  public static async modalResponse(client: Client, interaction: ModalMessageModalSubmitInteraction<'cached'>, id: string, method: string) {
    const messageType = method.split('.')[1] as WelcomeMessageType

    if (method.startsWith('welcomeEditorEmbed')) {
      await WelcomeEditorEmbed.response(client, interaction, id, messageType)
    }

    else if (method.startsWith('welcomeEditorMessage')) {
      await WelcomeEditorMessage.response(client, interaction, id, messageType)
    }

    else if (method.startsWith('welcomeEditorAuthor')) {
      await WelcomeEditorAuthor.response(client, interaction, id, messageType)
    }

    else if (method.startsWith('welcomeEditorTitle')) {
      await WelcomeEditorTitle.response(client, interaction, id, messageType)
    }

    else if (method.startsWith('welcomeEditorFooter')) {
      await WelcomeEditorFooter.response(client, interaction, id, messageType)
    }

    else if (method.startsWith('welcomeEditorAddField')) {
      await WelcomeEditorAddField.response(client, interaction, id, messageType)
    }

    else if (method.startsWith('welcomeEditorEditField')) {
      const fieldId = parseInt(method.split('.')[2])
      await WelcomeEditorEditField.response(client, interaction, id, messageType, fieldId)
    }
  }
}