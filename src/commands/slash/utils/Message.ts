import { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, MessageActionRowComponentBuilder, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, SelectMenuBuilder, SelectMenuComponentOptionData, SelectMenuInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'
import { colors } from '../../../libs/config/design'
import { owners } from '../../../libs/config/settings'
import NoirClient from '../../../libs/structures/Client'
import NoirChatCommand from '../../../libs/structures/command/ChatCommand'
import NoirMessage from '../../../libs/structures/Message'

export default class MessageCommand extends NoirChatCommand {
  constructor(client: NoirClient) {
    super(
      client,
      {
        permissions: ['SendMessages', 'EmbedLinks'],
        category: 'information',
        access: 'public',
        type: 'public',
        status: true
      },
      {
        name: 'message',
        description: 'Send message from bot',
        nameLocalizations: { 'ru': 'сообщение' },
        descriptionLocalizations: { 'ru': 'Отправить сообшения от имени бота' },
        defaultMemberPermissions: ['ManageMessages', 'EmbedLinks'],
        type: ApplicationCommandType.ChatInput,
        dmPermission: false,
      }
    )
  }

  private premiumEmoji = '🌟'
  private clientAvatar = this.client.user?.avatarURL()
  private creatorAvatar = this.client.users.cache.get(owners[0])?.avatarURL()

  private backButton = (id: string): ButtonBuilder => this.generateButton('Back', 'back', id, { style: ButtonStyle.Secondary })
  private premiumStatus = (client: NoirClient, id?: string): boolean => id ? client.noirPremiums.get(id)?.status ?? false : false

  private generateId = (userId: string, guildId: string): string => `${userId}${guildId}`
  private modifyId = (id?: string) => id?.replaceAll('-', '').replaceAll(' ', '') ?? ''
  private generateButtonId = (id: string, type: string): string => `message-${id}-${type}-button`
  private generateSelectId = (id: string, type: string): string => `message-${id}-${type}-select`
  private generateModalId = (id: string, type: string): string => `message-${id}-${type}-modal`
  private generateInputId = (id: string, type: string): string => `message-${id}-${type}-input`
  private generateButtonStyle = (status?: boolean | string): ButtonStyle => status ? ButtonStyle.Success : ButtonStyle.Secondary

  private generateButton(label: string, buttonId: string, id: string, properties: {
    style?: ButtonStyle,
    url?: string,
    emoji?: string,
    disabled?: boolean
  }): ButtonBuilder {
    const button = new ButtonBuilder()
      .setLabel(label)
      .setCustomId(this.generateButtonId(id, buttonId))
      .setStyle(properties?.style ?? ButtonStyle.Secondary)
      .setDisabled(properties?.disabled ?? false)

    if (properties?.emoji) button.setEmoji(properties.emoji)
    if (properties?.url) button.setURL(properties.url)

    return button
  }

  private generateModal(title: string, modalId: string, id: string, components: ActionRowBuilder<TextInputBuilder>[]): ModalBuilder {
    return new ModalBuilder()
      .setTitle(title)
      .setCustomId(this.generateModalId(id, modalId))
      .addComponents(components)
  }

  private generateTextInput(label: string, inputId: string, id: string, properties: {
    style?: TextInputStyle,
    placeHolder?: string,
    value?: string,
    required?: boolean,
    maxLength?: number,
    minLength?: number,
  }): TextInputBuilder {
    const textInput = new TextInputBuilder()
      .setLabel(label)
      .setCustomId(this.generateInputId(id, inputId))
      .setStyle(properties?.style ? properties.style : TextInputStyle.Paragraph)
      .setRequired(properties?.required ? properties.required : false)

    if (properties?.placeHolder) textInput.setPlaceholder(properties.placeHolder)
    if (properties?.maxLength) textInput.setMaxLength(properties.maxLength)
    if (properties?.minLength) textInput.setMinLength(properties.minLength)
    if (properties?.value) textInput.setValue(properties.value)

    return textInput
  }

  private generateSelectMenu(placeholder: string, selectId: string, id: string, properties?: {
    maxValues?: number,
    minValues?: number,
    options?: SelectMenuComponentOptionData[]
  }) {
    const selectMenu = new SelectMenuBuilder()
      .setCustomId(this.generateSelectId(id, selectId))
      .setPlaceholder(placeholder)

    if (properties?.maxValues) selectMenu.setMaxValues(properties.maxValues)
    if (properties?.minValues) selectMenu.setMaxValues(properties.minValues)
    if (properties?.options) selectMenu.setOptions(properties.options)

    return selectMenu
  }

  private generateModalActionRows(...inputs: ModalActionRowComponentBuilder[]): ActionRowBuilder<ModalActionRowComponentBuilder>[] {
    const actionRows = [] as ActionRowBuilder<ModalActionRowComponentBuilder>[]

    for (const input of inputs) {
      actionRows.push(new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents([input]))
    }

    return actionRows
  }

  private generateMessageActionRows(...components: MessageActionRowComponentBuilder[] | ButtonBuilder[]): ActionRowBuilder<MessageActionRowComponentBuilder> {
    return new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(components)
  }

  public async execute(client: NoirClient, interaction: ChatInputCommandInteraction | ButtonInteraction): Promise<void> {
    if (!interaction.guild?.id) {
      await client.noirReply.reply({
        interaction: interaction,
        color: colors.Warning,
        author: 'Server error',
        description: 'Command is server only'
      })

      return
    }

    const id = this.generateId(interaction.user.id, interaction.guild.id)

    if (!client.noirMessages.get(id)) {
      client.noirMessages.set(id, new NoirMessage(id, client, interaction))
    }

    await this.messageRequest(client, interaction, id)
  }

  public async messageRequest(client: NoirClient, interaction: ChatInputCommandInteraction | ButtonInteraction | ModalMessageModalSubmitInteraction | SelectMenuInteraction, id: string): Promise<void> {
    const message = client.noirMessages.get(id)
    const premium = this.premiumStatus(client, interaction.guild?.id)
    const fieldsLength = message?.fields?.size ?? 0

    const buttons = [
      [
        this.generateButton('Embed settings', 'embed', id, { style: this.generateButtonStyle(message?.status) }),
        this.generateButton('Embed author', 'author', id, { style: this.generateButtonStyle(message?.author.text) }),
        this.generateButton('Embed title', 'title', id, { style: this.generateButtonStyle(message?.title.text) }),
        this.generateButton('Embed footer', 'footer', id, { style: this.generateButtonStyle(message?.footer.text), disabled: !premium, emoji: this.premiumEmoji })
      ],
      [
        this.generateButton('Add embed field', 'fieldAdd', id, { disabled: fieldsLength >= 25 || !premium, emoji: this.premiumEmoji }),
        this.generateButton('Remove embed field', 'fieldRemove', id, { disabled: fieldsLength < 1 || !premium, emoji: this.premiumEmoji }),
        this.generateButton('Edit embed field', 'fieldEditList', id, { disabled: fieldsLength < 1 || !premium, emoji: this.premiumEmoji })
      ],
      [
        this.generateButton('Reset', 'reset', id, { style: ButtonStyle.Danger }),
        this.generateButton('Cancel', 'cancel', id, { style: ButtonStyle.Danger }),
        this.generateButton('Show example', 'example', id, { style: ButtonStyle.Primary }),
        this.generateButton('Send example', 'send', id, { style: ButtonStyle.Primary }),
        this.generateButton('Message content', 'content', id, { style: this.generateButtonStyle(message?.content) })
      ]
    ]

    const actionRows = [
      this.generateMessageActionRows(...buttons[0]),
      this.generateMessageActionRows(...buttons[1]),
      this.generateMessageActionRows(...buttons[2]),
    ]

    const fields = [
      {
        name: 'Premium features',
        value: 'Some features are premium only, but you can unlock them anytime you want and support us',
        inline: false
      },
      {
        name: 'Input variables',
        value: `Enter \`${message?.removeValue}\` to delete value of the input. Some inputs require variables, such as embed color, embed image etc`,
        inline: false
      }
    ]

    await client.noirReply.reply({
      interaction: interaction,
      color: colors.Primary,
      author: 'Message builder',
      description: 'Create your **custom, cool and beautiful** embed message with our advanced embed message builder. Create various type of embed messages like **rules, instructions, announcements** and share with your awesome community!',
      footer: 'Created with 💚 by Loid',
      authorImage: this.clientAvatar ? this.clientAvatar : undefined,
      footerImage: this.creatorAvatar ? this.creatorAvatar : undefined,
      components: actionRows,
      fields: fields,
      fetch: true,
    })
  }

  private async cancelResponse(client: NoirClient, interaction: ButtonInteraction, id: string): Promise<void> {
    client.noirMessages.delete(id)

    await client.noirReply.reply({
      interaction: interaction,
      color: colors.Success,
      author: 'Successfully done',
      description: 'Message constructor was canceled and deleted'
    })

    return
  }

  private async resetResponse(client: NoirClient, interaction: ButtonInteraction, id: string): Promise<void> {
    client.noirMessages.delete(id)
    client.noirMessages.set(id, new NoirMessage(id, client, interaction))

    await this.messageRequest(client, interaction, id)
  }

  private async sendResponse(client: NoirClient, interaction: ButtonInteraction, id: string): Promise<void> {
    const message = client.noirMessages.get(id)
    const embed = message?.embed.data
    const status = message?.status
    const content = message?.content

    try {
      if (status && embed && content) await interaction.channel?.send({ embeds: [embed], content: content })
      else if (status && embed && !content) await interaction.channel?.send({ embeds: [embed] })
      else if (!status && content) await interaction.channel?.send({ content: content })
      else {
        await client.noirReply.reply({
          interaction: interaction,
          author: 'Empty message',
          description: 'Can\'t show empty message',
          color: colors.Warning,
          components: [this.generateMessageActionRows(this.backButton(id))]
        })

        return
      }

      this.messageRequest(client, interaction, id)
    } catch {
      return
    }
  }

  private async exampleResponse(client: NoirClient, interaction: ButtonInteraction, id: string): Promise<void> {
    const message = client.noirMessages.get(id)
    const embed = message?.embed.data
    const status = message?.status
    const content = message?.content
    const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(this.backButton(id))

    try {
      if (status && embed && content) await interaction.update({ embeds: [embed], content: content, components: [actionRow] })
      else if (status && embed && !content) await interaction.update({ embeds: [embed], content: content, components: [actionRow] })
      else if (!status && content) await interaction.update({ content: content, components: [actionRow] })
      else {
        await client.noirReply.reply({
          interaction: interaction,
          author: 'Empty message',
          description: 'Can\'t show empty message',
          color: colors.Warning,
          components: [this.generateMessageActionRows(this.backButton(id))]
        })

        return
      }
    } catch {
      return
    }
  }

  public async buttonResponse(client: NoirClient, interaction: ButtonInteraction): Promise<void> {
    const parts = interaction.customId.split('-')
    const type = parts[2]
    const id = parts[1]

    if (type == 'back') await this.messageRequest(client, interaction, id)
    else if (type == 'cancel') await this.cancelResponse(client, interaction, id)
    else if (type == 'reset') await this.resetResponse(client, interaction, id)
    else if (type == 'send') await this.sendResponse(client, interaction, id)
    else if (type == 'example') await this.exampleResponse(client, interaction, id)
    else if (type == 'content') await this.contentRequest(client, interaction, id)
    else if (type == 'embed') await this.embedRequest(client, interaction, id)
    else if (type == 'title') await this.titleRequest(client, interaction, id)
    else if (type == 'author') await this.authorRequest(client, interaction, id)
    else if (type == 'footer') await this.footerRequest(client, interaction, id)
    else if (type == 'fieldAdd') await this.fieldAddRequest(client, interaction, id)
    else if (type == 'fieldRemove') await this.fieldRemoveRequest(client, interaction, id)
    else if (type == 'fieldEditList') await this.fieldEditListRequest(client, interaction, id)
  }

  public async modalResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction): Promise<void> {
    const parts = interaction.customId.split('-')
    const type = parts[2]
    const id = parts[1]

    console.log(parts)

    if (type == 'content') await this.contentResponse(client, interaction, id)
    else if (type == 'embed') await this.embedResponse(client, interaction, id)
    else if (type == 'title') await this.titleResponse(client, interaction, id)
    else if (type == 'author') await this.authorResponse(client, interaction, id)
    else if (type == 'footer') await this.footerResponse(client, interaction, id)
    else if (type == 'fieldAdd') await this.fieldAddResponse(client, interaction, id)
    else if (type == 'fieldEdit') {
      const oldId = `${parts[parts.length - 2]}-${parts[parts.length - 1]}`
      await this.fieldEditResponse(client, interaction, id, oldId)
    }
  }

  public async selectResponse(client: NoirClient, interaction: SelectMenuInteraction): Promise<void> {
    const parts = interaction.customId.split('-')
    const values = interaction.values
    const type = parts[2]
    const id = parts[1]

    if (type == 'fieldRemove') await this.fieldRemoveResponse(client, interaction, id)
    else if (type == 'fieldEditList') await this.fieldEditRequest(client, interaction, id, values[0])
  }

  private async contentRequest(client: NoirClient, interaction: ButtonInteraction, id: string): Promise<void> {
    const message = client.noirMessages.get(id)

    const contentInput = this.generateTextInput('Message content', 'content', id, {
      placeHolder: 'Enter message content',
      value: message?.content ?? '',
      required: true,
      maxLength: 2000
    })

    const actionRows = this.generateModalActionRows(contentInput)
    const modal = this.generateModal('Message content builder', 'content', id, actionRows)

    await interaction.showModal(modal)
  }

  private async contentResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string): Promise<void> {
    const content = interaction.fields.getTextInputValue(this.generateInputId(id, 'content'))

    client.noirMessages.get(id)?.setContent(content)

    await this.messageRequest(client, interaction, id)
  }

  private async embedRequest(client: NoirClient, interaction: ButtonInteraction, id: string): Promise<void> {
    const message = client.noirMessages.get(id)

    const colorInput = this.generateTextInput('Embed color', 'color', id, {
      style: TextInputStyle.Short,
      placeHolder: 'Primary, secondary, tertiary, success, warning, embed',
      value: message?.color ?? '',
      maxLength: 10
    })
    const descriptionInput = this.generateTextInput('Embed description', 'description', id, {
      placeHolder: 'Enter the description',
      value: message?.description ?? '',
      maxLength: 2000
    })
    const imageInput = this.generateTextInput('Embed image', 'image', id, {
      style: TextInputStyle.Short,
      placeHolder: 'Url, server, user, client',
      value: message?.image ?? '',
      maxLength: 2000
    })
    const thumbnailInput = this.generateTextInput('Embed thumbnail', 'thumbnail', id, {
      style: TextInputStyle.Short,
      placeHolder: 'Url, server, user, client',
      value: message?.thumbnail ?? '',
      maxLength: 2000
    })
    const timestampInput = this.generateTextInput('Embed timestamp', 'timestamp', id, {
      style: TextInputStyle.Short,
      placeHolder: 'True or false',
      value: message?.timestamp ? 'True' : 'False',
      maxLength: 5
    })

    const actionRows = this.generateModalActionRows(colorInput, descriptionInput, imageInput, thumbnailInput, timestampInput)
    const modal = this.generateModal('Embed settings', 'embed', id, actionRows)

    await interaction.showModal(modal)
  }

  private async embedResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string): Promise<void> {
    const message = client.noirMessages.get(id)
    const color = interaction.fields.getTextInputValue(this.generateInputId(id, 'color'))
    const description = interaction.fields.getTextInputValue(this.generateInputId(id, 'description'))
    const thumbnail = interaction.fields.getTextInputValue(this.generateInputId(id, 'thumbnail'))
    const image = interaction.fields.getTextInputValue(this.generateInputId(id, 'image'))
    const timestamp = interaction.fields.getTextInputValue(this.generateInputId(id, 'timestamp'))

    if (color) message?.setColor(color)
    if (description) message?.setDescription(description)
    if (thumbnail) message?.setThumbnail(thumbnail)
    if (image) message?.setImage(image)
    if (timestamp) message?.setTimestamp(timestamp)

    await this.messageRequest(client, interaction, id)
  }

  private async titleRequest(client: NoirClient, interaction: ButtonInteraction, id: string): Promise<void> {
    const message = client.noirMessages.get(id)

    const titleInput = this.generateTextInput('Embed title', 'title', id, {
      style: TextInputStyle.Short,
      placeHolder: 'Enter title text',
      value: message?.title.text ?? '',
      required: true,
      maxLength: 2000
    })
    const titleURLInput = this.generateTextInput('Embed URL', 'titleURL', id, {
      style: TextInputStyle.Short,
      placeHolder: 'Enter URL',
      value: message?.title.url ?? '',
      maxLength: 2000
    })

    const actionRows = this.generateModalActionRows(titleInput, titleURLInput)
    const modal = this.generateModal('Embed title builder', 'title', id, actionRows)

    await interaction.showModal(modal)
  }

  private async titleResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string): Promise<void> {
    const title = interaction.fields.getTextInputValue(`message-${id}-title-input`)
    const titleURL = interaction.fields.getTextInputValue(`message-${id}-titleURL-input`) ?? undefined

    client.noirMessages.get(id)?.setTitle(title, titleURL)

    await this.messageRequest(client, interaction, id)
  }

  private async authorRequest(client: NoirClient, interaction: ButtonInteraction, id: string): Promise<void> {
    const message = client.noirMessages.get(id)

    const authorInput = this.generateTextInput('Embed author', 'author', id, {
      style: TextInputStyle.Short,
      placeHolder: 'Enter author name',
      value: message?.author.text ?? '',
      required: true,
      maxLength: 2000
    })
    const authorImageInput = this.generateTextInput('Embed author image', 'authorImage', id, {
      style: TextInputStyle.Short,
      placeHolder: 'Url, client, user, server',
      value: message?.author.image ?? '',
      maxLength: 2000
    })

    const actionRows = this.generateModalActionRows(authorInput, authorImageInput)
    const modal = this.generateModal('Embed author builder', 'author', id, actionRows)

    await interaction.showModal(modal)
  }

  private async authorResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string): Promise<void> {
    const author = interaction.fields.getTextInputValue(this.generateInputId(id, 'author'))
    const authorImage = interaction.fields.getTextInputValue(this.generateInputId(id, 'authorImage'))

    client.noirMessages.get(id)?.setAuthor(author, authorImage)

    await this.messageRequest(client, interaction, id)
  }

  private async footerRequest(client: NoirClient, interaction: ButtonInteraction, id: string): Promise<void> {
    const message = client.noirMessages.get(id)

    const footerInput = this.generateTextInput('Embed footer', 'footer', id, {
      style: TextInputStyle.Short,
      placeHolder: 'Enter author text',
      value: message?.footer.text ?? '',
      required: true,
      maxLength: 2000
    })
    const footerImageInput = this.generateTextInput('Embed footer icon', 'footerImage', id, {
      style: TextInputStyle.Short,
      placeHolder: 'Url, client, user, server',
      value: message?.footer.image ?? '',
      maxLength: 2000
    })

    const actionRows = this.generateModalActionRows(footerInput, footerImageInput)
    const modal = this.generateModal('Embed footer builder', 'footer', id, actionRows)

    await interaction.showModal(modal)
  }

  private async footerResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string): Promise<void> {
    const footer = interaction.fields.getTextInputValue(this.generateInputId(id, 'footer'))
    const footerImage = interaction.fields.getTextInputValue(this.generateInputId(id, 'footerImage'))

    client.noirMessages.get(id)?.setFooter(footer, footerImage)

    await this.messageRequest(client, interaction, id)
  }

  private async fieldAddRequest(client: NoirClient, interaction: ButtonInteraction, id: string): Promise<void> {
    const nameInput = this.generateTextInput('Embed field name', 'fieldName', id, {
      style: TextInputStyle.Short,
      placeHolder: 'Enter field name',
      required: true,
      maxLength: 2000
    })
    const valueInput = this.generateTextInput('Embed field value', 'fieldValue', id, {
      placeHolder: 'Enter field value',
      required: true,
      maxLength: 2000
    })
    const inlineInput = this.generateTextInput('Embed field inline', 'fieldInline', id, {
      style: TextInputStyle.Short,
      placeHolder: 'True or false',
      maxLength: 5
    })

    const actionRows = this.generateModalActionRows(nameInput, valueInput, inlineInput)
    const modal = this.generateModal('Embed field builder', 'fieldAdd', id, actionRows)

    await interaction.showModal(modal)
  }

  private async fieldAddResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string): Promise<void> {
    const name = interaction.fields.getTextInputValue(this.generateInputId(id, 'fieldName'))
    const value = interaction.fields.getTextInputValue(this.generateInputId(id, 'fieldValue'))
    const inline = interaction.fields.getTextInputValue(this.generateInputId(id, 'fieldInline')).toLowerCase()

    if (name && value && inline || name && value) {
      client.noirMessages.get(id)?.addField({ name: name, value: value, inline: inline == 'true' ? true : false })
    }

    await this.messageRequest(client, interaction, id)
  }

  private async fieldRemoveRequest(client: NoirClient, interaction: ButtonInteraction, id: string): Promise<void> {
    const message = client.noirMessages.get(id)

    if (!message?.fields?.size) return

    const selectMenu = this.generateSelectMenu('Choose field(s) to remove', 'fieldRemove', id, {
      minValues: 1,
      maxValues: message.fields.size,
      options: message.fields.map(field => {
        return {
          label: field.name,
          description: 'Select to remove',
          value: `${this.modifyId(field.name) + '-' + this.modifyId(field.value)}`
        } as SelectMenuComponentOptionData
      })
    })

    const selectActionRow = this.generateMessageActionRows(selectMenu)
    const buttonActionRow = this.generateMessageActionRows(this.backButton(id))

    try {
      await client.noirReply.reply({
        interaction: interaction,
        author: 'Embed field editor',
        description: 'Select field(s) to remove',
        color: colors.Primary,
        components: [selectActionRow, buttonActionRow]
      })
    } catch {
      return
    }
  }

  private async fieldRemoveResponse(client: NoirClient, interaction: SelectMenuInteraction, id: string): Promise<void> {
    const fields = interaction.values

    fields.map(field => {
      client.noirMessages.get(id)?.removeField(field)
    })

    await this.messageRequest(client, interaction, id)
  }

  private async fieldEditListRequest(client: NoirClient, interaction: ButtonInteraction, id: string): Promise<void> {
    const message = client.noirMessages.get(id)

    if (!message?.fields?.size) return

    const selectMenu = this.generateSelectMenu('Choose field to edit', 'fieldEditList', id, {
      maxValues: message.fields.size,
      minValues: 1,
      options: message.fields.map(field => {
        return {
          label: field.name,
          description: 'Select to remove',
          value: `${this.modifyId(field.name) + '-' + this.modifyId(field.value)}`
        } as SelectMenuComponentOptionData
      })
    })

    const selectActionRow = this.generateMessageActionRows(selectMenu)
    const buttonActionRow = this.generateMessageActionRows(this.backButton(id))

    try {
      await client.noirReply.reply({
        interaction: interaction,
        author: 'Embed fields edit',
        description: 'Select field(s) to edit',
        color: colors.Primary,
        components: [selectActionRow, buttonActionRow]
      })
    } catch {
      return
    }
  }

  private async fieldEditRequest(client: NoirClient, interaction: SelectMenuInteraction, id: string, fieldId: string): Promise<void> {
    const message = client.noirMessages.get(id)

    const fieldName = this.generateTextInput('Embed field name', 'fieldName', id, {
      style: TextInputStyle.Short,
      placeHolder: 'Enter field name',
      value: message?.fields?.get(fieldId)?.name ?? '',
      required: true,
      maxLength: 2000
    })
    const fieldValue = this.generateTextInput('Embed field value', 'fieldValue', id, {
      placeHolder: 'Enter field value',
      value: message?.fields?.get(fieldId)?.value ?? '',
      required: true,
      maxLength: 2000
    })
    const fieldInline = this.generateTextInput('Embed field inline', 'fieldInline', id, {
      style: TextInputStyle.Short,
      placeHolder: 'True or false',
      value: message?.fields?.get(fieldId)?.inline ? 'True' : 'False',
      required: false,
      maxLength: 5
    })

    const actionRows = this.generateModalActionRows(fieldName, fieldValue, fieldInline)

    const modal = this.generateModal('Embed field editor', '', id, actionRows)
      .setCustomId(this.generateModalId(id, 'fieldEdit') + `-${this.modifyId(message?.fields?.get(fieldId)?.name)}-${this.modifyId(message?.fields?.get(fieldId)?.value)}`)

    await interaction.showModal(modal)
  }

  private async fieldEditResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string, oldId: string): Promise<void> {
    const name = interaction.fields.getTextInputValue(this.generateInputId(id, 'fieldName'))
    const value = interaction.fields.getTextInputValue(this.generateInputId(id, 'fieldValue'))
    const inline = interaction.fields.getTextInputValue(this.generateInputId(id, 'fieldInline')).toLowerCase()

    if (name && value && inline == 'true' || name && value && inline == 'false') {
      client.noirMessages.get(id)?.editField(oldId, { name: name, value: value, inline: inline == 'true' ? true : false })
    }

    await this.messageRequest(client, interaction, id)
  }
}