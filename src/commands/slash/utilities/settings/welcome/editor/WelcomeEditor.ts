import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ColorResolvable, MessageActionRowComponentBuilder, ModalMessageModalSubmitInteraction, SelectMenuBuilder, SelectMenuInteraction } from 'discord.js'
import Colors from '../../../../../../constants/Colors'
import Options, { WelcomeMessageType } from '../../../../../../constants/Options'
import NoirClient from '../../../../../../structures/Client'
import WelcomeEditorAddField from './fields/WelcomeEditorAddField'
import WelcomeEditorEditField from './fields/WelcomeEditorEditField'
import WelcomeEditorRemoveField from './fields/WelcomeEditorRemoveField'
import WelcomeEditorAuthor from './WelcomeEditorAuthor'
import WelcomeEditorEmbed from './WelcomeEditorEmbed'
import WelcomeEditorFooter from './WelcomeEditorFooter'
import WelcomeEditorMessage from './WelcomeEditorMessage'
import WelcomeEditorTitle from './WelcomeEditorTitle'

export default class WelcomeEditor {
  public static title = 'Welcome message editor'

  public static getMessageType(client: NoirClient, id: string, type: WelcomeMessageType) {
    const welcomeData = client.welcomeSettings.get(id)
    let messageStatus
    let messageData

    if (type == 'guild_join') {
      messageData = welcomeData?.data.messages.guild.join
      messageStatus = welcomeData?.data.messages.guild.status
    } else if (type == 'guild_left') {
      messageData = welcomeData?.data.messages.guild.left
      messageStatus = welcomeData?.data.messages.guild.status
    } else {
      messageData = welcomeData?.data.messages.direct.join
      messageStatus = welcomeData?.data.messages.direct.status
    }

    return { messageData, messageStatus }
  }

  public static async initialMessage(client: NoirClient, interaction: ButtonInteraction | ModalMessageModalSubmitInteraction | SelectMenuInteraction, id: string, type: WelcomeMessageType = 'guild_join') {
    const { messageData, messageStatus } = this.getMessageType(client, id, type)
    const embedStatus = messageData?.embed.color || messageData?.embed.description || messageData?.embed.image || messageData?.embed.thumbnail || messageData?.embed.timestamp
    const exampleStatus = messageData?.embed.description || messageData?.embed.image || messageData?.embed.thumbnail || messageData?.embed.author || messageData?.embed.authorImage || messageData?.embed.footer || messageData?.embed.title

    const buttons = [
      [
        new ButtonBuilder()
          .setCustomId(client.componentsUtils.generateId('settings', id, `welcomeEditorEmbed.${type}`, 'button'))
          .setLabel('Embed settings')
          .setStyle(client.componentsUtils.generateStyle(embedStatus))
          .setDisabled(!messageStatus),
        new ButtonBuilder()
          .setCustomId(client.componentsUtils.generateId('settings', id, `welcomeEditorAuthor.${type}`, 'button'))
          .setLabel('Embed author')
          .setStyle(client.componentsUtils.generateStyle(messageData?.embed.author || messageData?.embed.authorImage))
          .setDisabled(!messageStatus),
        new ButtonBuilder()
          .setCustomId(client.componentsUtils.generateId('settings', id, `welcomeEditorTitle.${type}`, 'button'))
          .setLabel('Embed title')
          .setStyle(client.componentsUtils.generateStyle(messageData?.embed.title || messageData?.embed.url))
          .setDisabled(!messageStatus),
        new ButtonBuilder()
          .setCustomId(client.componentsUtils.generateId('settings', id, `welcomeEditorFooter.${type}`, 'button'))
          .setLabel('Embed footer')
          .setStyle(client.componentsUtils.generateStyle(messageData?.embed.footer || messageData?.embed.footerImage))
          .setDisabled(!messageStatus)
      ],
      [
        new ButtonBuilder()
          .setCustomId(client.componentsUtils.generateId('settings', id, `welcomeEditorAddField.${type}`, 'button'))
          .setLabel('Add embed field')
          .setStyle(client.componentsUtils.defaultStyle)
          .setDisabled(!messageStatus || messageData?.embed.fields.length == 25 || !client.utils.premiumStatus(id))
          .setEmoji(Options.premiumEmoji),
        new ButtonBuilder()
          .setCustomId(client.componentsUtils.generateId('settings', id, `welcomeEditorRemoveFields.${type}`, 'button'))
          .setLabel('Remove embed fields')
          .setStyle(client.componentsUtils.defaultStyle)
          .setDisabled(!messageStatus || messageData?.embed.fields.length == 0)
          .setEmoji(Options.premiumEmoji),
        new ButtonBuilder()
          .setCustomId(client.componentsUtils.generateId('settings', id, `welcomeEditorEditFields.${type}`, 'button'))
          .setLabel('Edit embed fields')
          .setStyle(client.componentsUtils.defaultStyle)
          .setDisabled(!messageStatus || messageData?.embed.fields.length == 0 || !client.utils.premiumStatus(id))
          .setEmoji(Options.premiumEmoji)
      ],
      [
        new ButtonBuilder()
          .setCustomId(client.componentsUtils.generateId('settings', id, `welcomeEditorStatus.${type}`, 'button'))
          .setLabel(`${messageStatus ? 'Disable' : 'Enable'} auto-messaging for this type`)
          .setStyle(client.componentsUtils.generateStyle(messageStatus)),
        new ButtonBuilder()
          .setCustomId(client.componentsUtils.generateId('settings', id, `welcomeEditorMessage.${type}`, 'button'))
          .setLabel('Message content')
          .setStyle(client.componentsUtils.generateStyle(messageData?.message))
          .setDisabled(!messageStatus)
      ],
      [
        client.componentsUtils.generateBack('settings', id, 'welcome'),
        client.componentsUtils.generateSave('settings', id, `welcomeSave.welcomeEditor.${type}`),
        client.componentsUtils.generateExample('settings', id, `welcomeExample.welcomeEditor.${type}`, !messageStatus || !exampleStatus),
        client.componentsUtils.generateRestore('settings', id, `welcomeRestore.welcomeEditor.${type}`),
        client.componentsUtils.generateReset('settings', id, `welcomeReset.welcomeEditor.${type}`)
      ]
    ]

    const selectMenu = new SelectMenuBuilder()
      .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeEditor', 'select'))
      .setPlaceholder('Choose message type')
      .setMaxValues(1)
      .setMinValues(1)
      .setOptions(
        {
          label: 'Guild join',
          description: 'Guild join message type',
          value: 'guild_join',
          default: type == 'guild_join'
        },
        {
          label: 'Guild left',
          description: 'Guild left message type',
          value: 'guild_left',
          default: type == 'guild_left'
        },
        {
          label: 'Direct join',
          description: 'Direct join',
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

    await client.reply.reply({
      interaction: interaction,
      color: Colors.primary,
      author: this.title,
      authorImage: Options.clientAvatar,
      description: 'Choose message type and setup with advanced message editor.',
      components: actionRows,
      fields: [{
        name: 'Variables',
        value: `\`${Options.removeValue}\` - Remove field value\n\`{{guild name}}\` - Guild name\n\`{{guild icon}}\` - Guild icon\n\`{{user name}}\` - User name\n\`{{user avatar}}\` - User avatar\n\`{{client name}}\` - Client name\n\`{{client avatar}}\` - Client avatar`,
        inline: false
      }],
      ephemeral: true
    })
  }

  public static async exampleResponse(client: NoirClient, interaction: ButtonInteraction, id: string, type: WelcomeMessageType) {
    const { messageData } = this.getMessageType(client, id, type)

    if (!messageData) return

    interaction.deferUpdate()
    const button = client.componentsUtils.generateBack('settings', id, 'welcomeBack.welcomeEditor')
    const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(button)
    const exampleStatus = messageData?.embed.description || messageData?.embed.image || messageData?.embed.thumbnail || messageData?.embed.author || messageData?.embed.authorImage || messageData?.embed.footer || messageData?.embed.title || messageData.embed.fields

    if (!exampleStatus) {
      await client.reply.reply({
        interaction: interaction,
        color: Colors.warning,
        author: 'Message error',
        description: 'Oops, seems like the message object is empty, try to add some properties',
        components: [actionRow]
      })
    }

    else {
      const data = { client: client.user?.username, guild: interaction.guild?.name, user: interaction.user.username, clientAvatar: client.user?.avatarURL({ size: 4096 }), guildIcon: interaction.guild?.iconURL({ size: 4096 }), userAvatar: interaction.user.avatarURL({ size: 4096 }) }

      await client.reply.reply({
        interaction: interaction,
        color: messageData.embed.color as ColorResolvable,
        author: client.utils.testFormatValue(messageData.embed.author, data),
        authorImage: messageData.embed.authorImage ?? client.utils.testFormatValue(messageData.embed.rawAuthorImage, data),
        content: client.utils.testFormatValue(messageData.message, data),
        description: client.utils.testFormatValue(messageData.embed.description, data),
        fields: messageData.embed.fields.map(field => {
          return {
            name: client.utils.testFormatValue(field.name, data) ?? field.name,
            value: client.utils.testFormatValue(field.value, data) ?? field.value,
            inline: field.inline
          }
        }),
        footer: client.utils.testFormatValue(messageData.embed.footer, data),
        footerImage: messageData.embed.rawFooterImage ?? client.utils.testFormatValue(messageData.embed.rawFooterImage, data),
        image: messageData.embed.image ?? client.utils.testFormatValue(messageData.embed.rawImage, data),
        thumbnail: messageData.embed.thumbnail ?? client.utils.testFormatValue(messageData.embed.rawThumbnail, data),
        components: [actionRow]
      })
    }
  }

  public static async resetRequest(client: NoirClient, interaction: ButtonInteraction, id: string, type: WelcomeMessageType) {
    const { messageData } = this.getMessageType(client, id, type)

    if (!messageData) return

    const buttons = [
      new ButtonBuilder()
        .setCustomId(client.componentsUtils.generateId('settings', id, `welcomeReset.a.${type}.cancel`, 'button'))
        .setLabel('Cancel')
        .setStyle(client.componentsUtils.defaultStyle),
      new ButtonBuilder()
        .setCustomId(client.componentsUtils.generateId('settings', id, `welcomeReset.a.${type}.confirm`, 'button'))
        .setLabel('YES! YES! YES!')
        .setStyle(client.componentsUtils.dangerStyle),
    ]

    const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons)

    await client.reply.reply({
      interaction: interaction,
      color: Colors.warning,
      authorImage: Options.clientAvatar,
      author: 'Reset confirmation',
      description: 'Are you sure you want to reset all message data. This won\'t affect saved data.',
      components: [actionRow]
    })
  }

  public static async resetResponse(client: NoirClient, interaction: ButtonInteraction, id: string, type: WelcomeMessageType) {
    const { messageData } = this.getMessageType(client, id, type)

    if (!messageData) return

    messageData.message = undefined
    messageData.embed = {
      fields: [],
      timestamp: false,
      author: undefined,
      authorImage: undefined,
      color: undefined,
      description: undefined,
      footer: undefined,
      footerImage: undefined,
      image: undefined,
      rawAuthorImage: undefined,
      rawColor: undefined,
      rawFooterImage: undefined,
      rawImage: undefined,
      rawThumbnail: undefined,
      thumbnail: undefined,
      title: undefined,
      url: undefined
    }

    this.initialMessage(client, interaction, id, type)
  }

  public static async buttonResponse(client: NoirClient, interaction: ButtonInteraction, id: string, method: string) {
    const messageType = method.split('.')[1] as WelcomeMessageType
    const welcomeData = client.welcomeSettings.get(id)?.data

    if (!welcomeData) return

    if (method == 'welcomeEditor') {
      await this.initialMessage(client, interaction, id, messageType)
    }

    else if (method.startsWith('welcomeEditorStatus')) {
      if (messageType == 'guild_join' || messageType == 'guild_left') {
        welcomeData.messages.guild.status = !welcomeData.messages.guild.status
      }

      else {
        welcomeData.messages.direct.status = !welcomeData.messages.direct.status
      }

      await WelcomeEditor.initialMessage(client, interaction, id, messageType)
    }

    else if (method.startsWith('welcomeEditorMessage')) {
      await WelcomeEditorMessage.request(client, interaction, id, messageType)
    }

    else if (method.startsWith('welcomeEditorEmbed')) {
      await WelcomeEditorEmbed.request(client, interaction, id, messageType)
    }

    else if (method.startsWith('welcomeEditorAuthor')) {
      await WelcomeEditorAuthor.request(client, interaction, id, messageType)
    }

    else if (method.startsWith('welcomeEditorTitle')) {
      await WelcomeEditorTitle.request(client, interaction, id, messageType)
    }

    else if (method.startsWith('welcomeEditorFooter')) {
      await WelcomeEditorFooter.request(client, interaction, id, messageType)
    }

    else if (method.startsWith('welcomeEditorAddField')) {
      await WelcomeEditorAddField.request(client, interaction, id, messageType)
    }

    else if (method.startsWith('welcomeEditorRemoveField')) {
      await WelcomeEditorRemoveField.request(client, interaction, id, messageType)
    }

    else if (method.startsWith('welcomeEditorEditField')) {
      await WelcomeEditorEditField.listRequest(client, interaction, id, messageType)
    }
  }

  public static async selectResponse(client: NoirClient, interaction: SelectMenuInteraction, id: string, method: string) {
    const messageType = method.split('.')[1] as WelcomeMessageType

    if (method == 'welcomeEditor') {
      const messageType = interaction.values[0] as WelcomeMessageType
      await this.initialMessage(client, interaction, id, messageType)
    }

    else if (method.startsWith('welcomeEditorRemoveField')) {
      await WelcomeEditorRemoveField.response(client, interaction, id, messageType)
    }

    else if (method.startsWith('welcomeEditorEditField')) {
      const fieldId = parseInt(interaction.values[0])
      await WelcomeEditorEditField.request(client, interaction, id, messageType, fieldId)
    }
  }

  public static async modalResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string, method: string) {
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