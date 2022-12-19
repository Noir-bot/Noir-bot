import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ColorResolvable, MessageActionRowComponentBuilder, ModalMessageModalSubmitInteraction, StringSelectMenuBuilder, StringSelectMenuInteraction } from 'discord.js'
import Colors from '../../../../../../constants/Colors'
import Options from '../../../../../../constants/Options'
import NoirClient from '../../../../../../structures/Client'
import Premium from '../../../../../../structures/Premium'
import WelcomeMessage, { WelcomeMessageType } from '../../../../../../structures/WelcomeMessage'
import SettingsUtils from '../../SettingsUtils'
import WelcomeEditorAddField from './fields/WelcomeEditorAddField'
import WelcomeEditorEditField from './fields/WelcomeEditorEditField'
import WelcomeEditorRemoveField from './fields/WelcomeEditorRemoveField'
import WelcomeEditorAuthor from './WelcomeEditorAuthor'
import WelcomeEditorEmbed from './WelcomeEditorEmbed'
import WelcomeEditorFooter from './WelcomeEditorFooter'
import WelcomeEditorMessage from './WelcomeEditorMessage'
import WelcomeEditorTitle from './WelcomeEditorTitle'

export default class WelcomeEditor {
  public static async initialMessage(client: NoirClient, interaction: ButtonInteraction<'cached'> | ModalMessageModalSubmitInteraction<'cached'> | StringSelectMenuInteraction<'cached'>, id: string, type: WelcomeMessageType = 'guild_join') {
    const messageData = await WelcomeMessage.cache(client, id, type)
    const premiumData = await Premium.cache(client, id)
    const embedStatus = messageData?.color ?? messageData?.description ?? messageData?.image ?? messageData?.thumbnail ?? messageData?.timestamp
    const exampleStatus = messageData?.description ?? messageData?.image ?? messageData?.thumbnail ?? messageData?.author ?? messageData?.authorImage ?? messageData?.footer ?? messageData?.title

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
          .setDisabled(!messageData.status)
      ],
      [
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, `welcomeEditorAddField.${type}`, 'button'))
          .setLabel('Add embed field')
          .setStyle(SettingsUtils.defaultStyle)
          .setDisabled(!messageData.status || messageData.fieldsId.length >= 25 || !premiumData?.status())
          .setEmoji(Options.premiumEmoji),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, `welcomeEditorRemoveFields.${type}`, 'button'))
          .setLabel('Remove embed fields')
          .setStyle(SettingsUtils.defaultStyle)
          .setDisabled(!messageData.status || messageData?.fieldsId.length == 0)
          .setEmoji(Options.premiumEmoji),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, `welcomeEditorEditFields.${type}`, 'button'))
          .setLabel('Edit embed fields')
          .setStyle(SettingsUtils.defaultStyle)
          .setDisabled(!messageData.status || messageData.fieldsId.length == 0 || !premiumData?.status())
          .setEmoji(Options.premiumEmoji)
      ],
      [
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, `welcomeEditorStatus.${type}`, 'button'))
          .setLabel(`${messageData.status ? 'Disable' : 'Enable'} auto message`)
          .setStyle(SettingsUtils.generateStyle(messageData.status)),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, `welcomeEditorMessage.${type}`, 'button'))
          .setLabel(`${messageData?.message ? 'Edit' : 'Add'} message content`)
          .setStyle(SettingsUtils.generateStyle(messageData?.message))
          .setDisabled(!messageData.status)
      ],
      [
        SettingsUtils.generateBack('settings', id, 'welcome'),
        SettingsUtils.generateSave('settings', id, `welcomeSave.welcomeEditor.${type}`),
        SettingsUtils.generateExample('settings', id, `welcomeExample.welcomeEditor.${type}`, !messageData.status || !exampleStatus),
        SettingsUtils.generateRestore('settings', id, `welcomeRestore.welcomeEditor.${type}`),
        SettingsUtils.generateReset('settings', id, `welcomeReset.welcomeEditor.${type}`)
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

  public static async exampleResponse(client: NoirClient, interaction: ButtonInteraction<'cached'>, id: string, type: WelcomeMessageType) {
    const messageData = await WelcomeMessage.cache(client, id, type)

    interaction.deferUpdate()

    const button = SettingsUtils.generateBack('settings', id, `welcomeBack.welcomeEditor.${type}`)
    const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(button)
    const exampleStatus = messageData?.description ?? messageData?.image ?? messageData?.thumbnail ?? messageData?.author ?? messageData?.authorImage ?? messageData?.footer ?? messageData?.title ?? messageData.fieldsId ?? messageData.message

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
      const variables = { guild: { name: interaction.guild?.name, icon: interaction.guild?.iconURL(), members: interaction.guild?.memberCount, createdAt: `<t:${interaction.guild?.createdAt.getTime().toString().slice(0, -3)}:d>`, created: `<t:${interaction.guild?.createdAt.getTime().toString().slice(0, -3)}:R>` }, user: { name: interaction.user.username, avatar: interaction.user.avatarURL(), createdAt: `<t:${interaction.user?.createdAt.getTime().toString().slice(0, -3)}:d>`, created: `<t:${interaction.user?.createdAt.getTime().toString().slice(0, -3)}:R>` }, client: { name: client.user?.username, avatar: client.user?.avatarURL() } }

      try {
        await client.reply.reply({
          interaction: interaction,
          color: messageData.color as ColorResolvable,
          author: WelcomeMessage.formatVariable(messageData.author, variables),
          title: WelcomeMessage.formatVariable(messageData.title, variables),
          url: WelcomeMessage.formatVariable(messageData.url, variables),
          authorImage: messageData.authorImage ?? WelcomeMessage.formatVariable(messageData.rawAuthorImage, variables),
          content: WelcomeMessage.formatVariable(messageData.message, variables),
          description: WelcomeMessage.formatVariable(messageData.description, variables),
          fields: messageData.fieldsId.map(id => {
            return {
              name: WelcomeMessage.formatVariable(messageData?.fieldsName[id], variables) ?? messageData?.fieldsName[id],
              value: WelcomeMessage.formatVariable(messageData?.fieldsName[id], variables) ?? messageData?.fieldsValue[id],
              inline: messageData?.fieldsInline[id]
            }
          }) ?? [],
          footer: WelcomeMessage.formatVariable(messageData.footer, variables),
          footerImage: messageData.footerImage ?? WelcomeMessage.formatVariable(messageData.rawFooterImage, variables),
          image: messageData.image ?? WelcomeMessage.formatVariable(messageData.rawImage, variables),
          thumbnail: messageData.thumbnail ?? WelcomeMessage.formatVariable(messageData.rawThumbnail, variables),
          components: [actionRow]
        })
      } catch (error) {
        await client.reply.reply({
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

  public static async resetRequest(client: NoirClient, interaction: ButtonInteraction<'cached'>, id: string, type: WelcomeMessageType) {
    const messageData = await WelcomeMessage.cache(client, id, type)

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

  public static async resetResponse(client: NoirClient, interaction: ButtonInteraction<'cached'>, id: string, type: WelcomeMessageType) {
    const messageData = await WelcomeMessage.cache(client, id, type)

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

  public static async buttonResponse(client: NoirClient, interaction: ButtonInteraction<'cached'>, id: string, method: string) {
    const messageType = method.split('.')[1] as WelcomeMessageType
    const action = method.split('.')[0]

    if (method == 'welcomeEditor') {
      await this.initialMessage(client, interaction, id, messageType)
    }

    else if (action == 'welcomeEditorStatus') {
      const messageData = await WelcomeMessage.cache(client, id, messageType)

      messageData.status = !messageData.status

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

  public static async selectResponse(client: NoirClient, interaction: StringSelectMenuInteraction<'cached'>, id: string, method: string) {
    const messageType = method.split('.')[1] as WelcomeMessageType

    if (method.startsWith('welcomeEditor')) {
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

  public static async modalResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction<'cached'>, id: string, method: string) {
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