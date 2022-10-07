import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ColorResolvable, GuildMember, MessageActionRowComponentBuilder, ModalMessageModalSubmitInteraction, SelectMenuBuilder, SelectMenuInteraction } from 'discord.js'
import Colors from '../../../../../../constants/Colors'
import Options, { WelcomeMessageType } from '../../../../../../constants/Options'
import NoirClient from '../../../../../../structures/Client'
import SettingsUtils from '../../SettingsUtils'
import WelcomeSettings from '../WelcomeSettings'
import WelcomeEditorAddField from './fields/WelcomeEditorAddField'
import WelcomeEditorEditField from './fields/WelcomeEditorEditField'
import WelcomeEditorRemoveField from './fields/WelcomeEditorRemoveField'
import WelcomeEditorAuthor from './WelcomeEditorAuthor'
import WelcomeEditorEmbed from './WelcomeEditorEmbed'
import WelcomeEditorFooter from './WelcomeEditorFooter'
import WelcomeEditorMessage from './WelcomeEditorMessage'
import WelcomeEditorTitle from './WelcomeEditorTitle'

export default class WelcomeEditor {
  public static async getMessageType(client: NoirClient, id: string, type: WelcomeMessageType) {
    let welcomeData = client.welcomeSettings.get(id)?.data

    if (!welcomeData) {
      welcomeData = await WelcomeSettings.generateCache(client, id)
    }

    let messageStatus
    let messageData

    if (type == 'guild_join') {
      messageData = welcomeData?.messages.guild.join
      messageStatus = welcomeData?.messages.guild.status
    } else if (type == 'guild_left') {
      messageData = welcomeData?.messages.guild.left
      messageStatus = welcomeData?.messages.guild.status
    } else {
      messageData = welcomeData?.messages.direct.join
      messageStatus = welcomeData?.messages.direct.status
    }

    return { messageData, messageStatus }
  }

  public static async initialMessage(client: NoirClient, interaction: ButtonInteraction | ModalMessageModalSubmitInteraction | SelectMenuInteraction, id: string, type: WelcomeMessageType = 'guild_join') {
    const { messageData, messageStatus } = await this.getMessageType(client, id, type)
    const embedStatus = messageData?.embed.color || messageData?.embed.description || messageData?.embed.image || messageData?.embed.thumbnail || messageData?.embed.timestamp
    const exampleStatus = messageData?.embed.description || messageData?.embed.image || messageData?.embed.thumbnail || messageData?.embed.author || messageData?.embed.authorImage || messageData?.embed.footer || messageData?.embed.title

    const buttons = [
      [
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, `welcomeEditorEmbed.${type}`, 'button'))
          .setLabel('Embed settings')
          .setStyle(SettingsUtils.generateStyle(embedStatus))
          .setDisabled(!messageStatus),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, `welcomeEditorAuthor.${type}`, 'button'))
          .setLabel('Embed author')
          .setStyle(SettingsUtils.generateStyle(messageData?.embed.author || messageData?.embed.authorImage))
          .setDisabled(!messageStatus),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, `welcomeEditorTitle.${type}`, 'button'))
          .setLabel('Embed title')
          .setStyle(SettingsUtils.generateStyle(messageData?.embed.title || messageData?.embed.url))
          .setDisabled(!messageStatus),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, `welcomeEditorFooter.${type}`, 'button'))
          .setLabel('Embed footer')
          .setStyle(SettingsUtils.generateStyle(messageData?.embed.footer || messageData?.embed.footerImage))
          .setDisabled(!messageStatus)
      ],
      [
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, `welcomeEditorAddField.${type}`, 'button'))
          .setLabel('Add embed field')
          .setStyle(SettingsUtils.defaultStyle)
          .setDisabled(!messageStatus || messageData?.embed.fields.length == 25 || !client.utils.premiumStatus(id))
          .setEmoji(Options.premiumEmoji),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, `welcomeEditorRemoveFields.${type}`, 'button'))
          .setLabel('Remove embed fields')
          .setStyle(SettingsUtils.defaultStyle)
          .setDisabled(!messageStatus || messageData?.embed.fields.length == 0)
          .setEmoji(Options.premiumEmoji),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, `welcomeEditorEditFields.${type}`, 'button'))
          .setLabel('Edit embed fields')
          .setStyle(SettingsUtils.defaultStyle)
          .setDisabled(!messageStatus || messageData?.embed.fields.length == 0 || !client.utils.premiumStatus(id))
          .setEmoji(Options.premiumEmoji)
      ],
      [
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, `welcomeEditorStatus.${type}`, 'button'))
          .setLabel(`${messageStatus ? 'Disable' : 'Enable'} auto-messaging for this type`)
          .setStyle(SettingsUtils.generateStyle(messageStatus)),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, `welcomeEditorMessage.${type}`, 'button'))
          .setLabel('Message content')
          .setStyle(SettingsUtils.generateStyle(messageData?.message))
          .setDisabled(!messageStatus)
      ],
      [
        SettingsUtils.generateBack('settings', id, 'welcome'),
        SettingsUtils.generateSave('settings', id, `welcomeSave.welcomeEditor.${type}`),
        SettingsUtils.generateExample('settings', id, `welcomeExample.welcomeEditor.${type}`, !messageStatus || !exampleStatus),
        SettingsUtils.generateRestore('settings', id, `welcomeRestore.welcomeEditor.${type}`),
        SettingsUtils.generateReset('settings', id, `welcomeReset.welcomeEditor.${type}`)
      ]
    ]

    const selectMenu = new SelectMenuBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeEditor', 'select'))
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
      author: 'Welcome message editor',
      authorImage: Options.clientAvatar,
      description: 'Choose message type and setup with advanced message editor.',
      components: actionRows,
      fields: [{
        name: 'Message variables',
        value: `\`${Options.removeValue}\` Remove field value\n\`{{guild name}}\` Guild name\n\`{{guild icon}}\` Guild icon\n\`{{guild members}}\` Guild members count\n\`{{guild createdAt}}\` Guild created at\n\`{{guild created}}\` Guild creation date\n\`{{client name}}\` Client name\n\`{{client avatar}}\` Client avatar\n\`{{user name}}\` User name\n\`{{user avatar}}\` User avatar\n\`{{user id}}\` User id\n\`{{user joinedAt}}\` User joined at\n\`{{user joined}}\` - User join date\n\`{{user createdAt}}\` - User account created at\n\`{{user created}}\` - User account creation date`,
        inline: false
      }],
      ephemeral: true
    })
  }

  public static exampleFormat(client: NoirClient, value?: string, data?: { guildName?: string | null, guildIcon?: string | null, guildMembers?: number | 0, guildCreatedAt?: string | null, guildCreated?: string | null, userName?: string | null, userAvatar?: string | null, userJoinedAt?: string | null, userJoined?: string | null, userCreatedAt?: string | null, userCreated?: string | null, clientName?: string | null, clientAvatar?: string | null }) {
    value = client.utils.removeFormatValue(value)

    if (data?.guildName) {
      value = value?.replace(/\{\{guild name\}\}/g, data.guildName)
    }

    if (data?.guildIcon) {
      value = value?.replace(/\{\{guild icon\}\}/g, data.guildIcon)
    }

    if (data?.guildMembers) {
      value = value?.replace(/\{\{guild members\}\}/g, `${data.guildMembers}`)
    }

    if (data?.guildCreated) {
      value = value?.replace(/\{\{guild created\}\}/g, data.guildCreated)
    }

    if (data?.guildCreatedAt) {
      value = value?.replace(/\{\{guild createdAt\}\}/g, data.guildCreatedAt)
    }

    if (data?.userName) {
      value = value?.replace(/\{\{user name\}\}/g, data.userName)
    }

    if (data?.userAvatar) {
      value = value?.replace(/\{\{user avatar\}\}/g, data.userAvatar)
    }

    if (data?.userCreated) {
      value = value?.replace(/\{\{user created\}\}/g, data.userCreated)
    }

    if (data?.userCreatedAt) {
      value = value?.replace(/\{\{user createdAt\}\}/g, data.userCreatedAt)
    }

    if (data?.userJoined) {
      value = value?.replace(/\{\{user joined\}\}/g, data.userJoined)
    }

    if (data?.userJoinedAt) {
      value = value?.replace(/\{\{user joinedAt\}\}/g, data.userJoinedAt)
    }

    if (data?.clientName) {
      value = value?.replace(/\{\{client name\}\}/g, data.clientName)
    }

    if (data?.clientAvatar) {
      value = value?.replace(/\{\{client avatar\}\}/g, data.clientAvatar)
    }

    return value
  }

  public static async exampleResponse(client: NoirClient, interaction: ButtonInteraction, id: string, type: WelcomeMessageType) {
    const { messageData } = await this.getMessageType(client, id, type)

    if (!messageData) return

    interaction.deferUpdate()
    const button = SettingsUtils.generateBack('settings', id, `welcomeBack.welcomeEditor.${type}`)
    const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(button)
    const exampleStatus = messageData?.embed.description || messageData?.embed.image || messageData?.embed.thumbnail || messageData?.embed.author || messageData?.embed.authorImage || messageData?.embed.footer || messageData?.embed.title || messageData.embed.fields

    if (!exampleStatus) {
      await client.reply.reply({
        interaction: interaction,
        color: Colors.warning,
        author: 'Message error',
        description: 'Message object is empty, setup message before testing.',
        components: [actionRow]
      })
    }

    else {
      const data = { guildName: interaction.guild?.name, guildIcon: interaction.guild?.iconURL({ size: 4096 }), guildMembers: interaction.guild?.memberCount, guildCreatedAt: `<t:${interaction.guild?.createdTimestamp.toString().slice(0, -3)}:R>`, guildCreated: `<t:${interaction.guild?.createdTimestamp.toString().slice(0, -3)}:f>`, userName: interaction.user.username, userAvatar: interaction.user.avatarURL({ size: 4096 }), userJoinedAt: `<t:${(interaction.member as GuildMember).joinedTimestamp?.toString().slice(0, -3)}:R>`, userJoined: `<t:${(interaction.member as GuildMember).joinedTimestamp?.toString().slice(0, -3)}:f>`, userCreatedAt: `<t:${interaction.user.createdTimestamp?.toString().slice(0, -3)}:R>`, userCreated: `<t:${interaction.user.createdTimestamp?.toString().slice(0, -3)}:f>`, clientName: client.user?.username, clientAvatar: client.user?.avatarURL({ size: 4096 }) }

      try {
        await client.reply.reply({
          interaction: interaction,
          color: messageData.embed.color as ColorResolvable,
          author: this.exampleFormat(client, messageData.embed.author, data),
          title: this.exampleFormat(client, messageData.embed.title, data),
          url: this.exampleFormat(client, messageData.embed.url, data),
          authorImage: messageData.embed.authorImage ?? this.exampleFormat(client, messageData.embed.rawAuthorImage, data),
          content: this.exampleFormat(client, messageData.message, data),
          description: this.exampleFormat(client, messageData.embed.description, data),
          fields: messageData.embed.fields.map(field => {
            return {
              name: this.exampleFormat(client, field.name, data) ?? field.name,
              value: this.exampleFormat(client, field.value, data) ?? field.value,
              inline: field.inline
            }
          }) ?? [],
          footer: this.exampleFormat(client, messageData.embed.footer, data),
          footerImage: messageData.embed.footerImage ?? this.exampleFormat(client, messageData.embed.rawFooterImage, data),
          image: messageData.embed.image ?? this.exampleFormat(client, messageData.embed.rawImage, data),
          thumbnail: messageData.embed.thumbnail ?? this.exampleFormat(client, messageData.embed.rawThumbnail, data),
          components: [actionRow]
        })
      } catch {
        return
      }
    }
  }

  public static async resetRequest(client: NoirClient, interaction: ButtonInteraction, id: string, type: WelcomeMessageType) {
    const { messageData } = await this.getMessageType(client, id, type)

    if (!messageData) return

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
    const { messageData } = await this.getMessageType(client, id, type)

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