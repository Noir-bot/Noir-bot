import { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, MessageActionRowComponentBuilder, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, SelectMenuBuilder, SelectMenuInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'
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

  private generateInputId(id: string, type: string): string {
    return `message-${id}-${type}-input`
  }

  private generateModalId(id: string, type: string): string {
    return `message-${id}-${type}-modal`
  }

  private generateSelectId(id: string, type: string): string {
    return `message-${id}-${type}-select`
  }

  private generateButtonId(id: string, type: string): string {
    return `message-${id}-${type}-button`
  }

  private generateButtonStyle(status?: boolean | string): ButtonStyle {
    const successStyle = ButtonStyle.Success
    const unsuccessStyle = ButtonStyle.Secondary

    return status ? successStyle : unsuccessStyle
  }

  private backButton(id: string) {
    return new ButtonBuilder()
      .setLabel('Back')
      .setCustomId(this.generateButtonId(id, 'back'))
      .setStyle(ButtonStyle.Secondary)
  }

  private editId(id?: string) {
    return id?.replaceAll('-', '').replaceAll(' ', '') ?? ''
  }

  public async execute(client: NoirClient, interaction: ChatInputCommandInteraction | ButtonInteraction): Promise<void> {
    const id = `${interaction.user.id}${interaction.guild?.id}`

    if (!client.noirMessages.get(id)) {
      client.noirMessages.set(id, new NoirMessage(id, client, interaction))
    }

    await this.message(client, interaction, id)
  }

  public async message(client: NoirClient, interaction: ChatInputCommandInteraction | ButtonInteraction | ModalMessageModalSubmitInteraction | SelectMenuInteraction, id: string): Promise<void> {
    const message = client.noirMessages.get(id)
    const premium = interaction.guild?.id ? client.noirPremiums.get(interaction.guild.id)?.status ?? false : false
    const fieldsLength = message?.fields ? message.fields?.entries.length : 0
    const ownerAvatar = (await client.users.fetch(owners[0])).avatarURL()
    const clientAvatar = client.user?.avatarURL()

    const buttons = [
      [
        new ButtonBuilder()
          .setLabel('Embed settings')
          .setCustomId(this.generateButtonId(id, 'embed'))
          .setStyle(this.generateButtonStyle(message?.status)),
        new ButtonBuilder()
          .setLabel('Embed author')
          .setCustomId(this.generateButtonId(id, 'author'))
          .setStyle(this.generateButtonStyle(message?.author.text)),
        new ButtonBuilder()
          .setLabel('Embed title')
          .setCustomId(this.generateButtonId(id, 'title'))
          .setStyle(this.generateButtonStyle(message?.title.text)),
        new ButtonBuilder()
          .setLabel('Embed footer')
          .setCustomId(this.generateButtonId(id, 'footer'))
          .setStyle(this.generateButtonStyle(message?.footer.text))
          .setEmoji('🌟')
          .setDisabled(fieldsLength > 25 || !premium),
      ],
      [
        new ButtonBuilder()
          .setLabel('Add embed field')
          .setCustomId(this.generateButtonId(id, 'fieldAdd'))
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('🌟')
          .setDisabled(fieldsLength > 25 || !premium),
        new ButtonBuilder()
          .setLabel('Remove embed field')
          .setCustomId(this.generateButtonId(id, 'fieldRemove'))
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('🌟')
          .setDisabled(fieldsLength > 25 || !premium),
        new ButtonBuilder()
          .setLabel('Edit embed field')
          .setCustomId(this.generateButtonId(id, 'fieldEditList'))
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('🌟')
          .setDisabled(fieldsLength > 25 || !premium)
      ],
      [
        new ButtonBuilder()
          .setLabel('Reset')
          .setCustomId(this.generateButtonId(id, 'reset'))
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setLabel('Cancel')
          .setCustomId(this.generateButtonId(id, 'cancel'))
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setLabel('Show example')
          .setCustomId(this.generateButtonId(id, 'example'))
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setLabel('Send message')
          .setCustomId(this.generateButtonId(id, 'send'))
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setLabel('Message content')
          .setCustomId(this.generateButtonId(id, 'content'))
          .setStyle(this.generateButtonStyle(message?.content))
      ]
    ]

    const actionRows = [
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[0]),
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[1]),
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[2]),
    ]

    await client.noirReply.reply({
      interaction: interaction,
      color: colors.Primary,
      description: 'Create your **custom, cool and beautiful** embed message with our advanced embed message builder. Create various type of embed messages like **rules, instructions, announcements** and share with your awesome community!',
      fields: [
        { name: 'Premium features', value: 'Some features are premium only, but you can unlock them anytime you want and support us', inline: false },
        { name: 'Input variables', value: `Enter \`${message?.removeValue}\` to delete value of the input. Some inputs require variables, such as embed color, embed image etc`, inline: false }
      ],
      author: 'Message builder',
      authorImage: clientAvatar ? clientAvatar : undefined,
      footer: 'Created with 💚 by Loid',
      footerImage: ownerAvatar ? ownerAvatar : undefined,
      components: actionRows,
      fetch: true,
    })
  }

  public async buttonResponse(client: NoirClient, interaction: ButtonInteraction): Promise<void> {
    const parts = interaction.customId.toLowerCase().split('-')
    const type = parts[2]
    const id = parts[1]

    if (type == 'back') await this.message(client, interaction, id)
    else if (type == 'cancel') {
      client.noirMessages.delete(id)

      await client.noirReply.reply({
        interaction: interaction,
        color: colors.Success,
        author: 'Successfully done',
        description: 'Message constructor was canceled and deleted'
      })

      return
    } else if (type == 'reset') {
      client.noirMessages.delete(id)
      client.noirMessages.set(id, new NoirMessage(id, client, interaction))

      await this.message(client, interaction, id)
    } else if (type == 'send') {
      const message = client.noirMessages.get(id)
      const embed = message?.embed.data
      const status = message?.status
      const content = message?.content

      try {
        if (status && embed && content) await interaction.channel?.send({ embeds: [embed], content: content })
        else if (status && embed && !content) await interaction.channel?.send({ embeds: [embed] })
        else if (!status && content) await interaction.channel?.send({ content: content })

        this.message(client, interaction, id)
      } catch (err) {
        await client.noirReply.reply({
          interaction: interaction,
          author: 'Unexpected error',
          description: 'Can\'t send empty message',
          color: colors.Warning
        })
      }
    } else if (type == 'example') {
      const message = client.noirMessages.get(id)
      const embed = message?.embed.data
      const status = message?.status
      const content = message?.content
      const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(this.backButton(id))

      try {
        if (status && embed && content) await interaction.update({ embeds: [embed], content: content, components: [actionRow] })
        else if (status && embed && !content) await interaction.update({ embeds: [embed], content: content, components: [actionRow] })
        else if (!status && content) await interaction.update({ content: content, components: [actionRow] })
      } catch (err) {
        await client.noirReply.reply({
          interaction: interaction,
          author: 'Unexpected error',
          description: 'Can\'t show empty message',
          color: colors.Warning
        })
      }
    } else if (type == 'content') await this.contentRequest(client, interaction, id)
    else if (type == 'embed') await this.embedRequest(client, interaction, id)
    else if (type == 'title') await this.titleRequest(client, interaction, id)
    else if (type == 'author') await this.authorRequest(client, interaction, id)
    else if (type == 'footer') await this.footerRequest(client, interaction, id)
    else if (type == 'fieldadd') await this.fieldAddRequest(client, interaction, id)
    else if (type == 'fieldremove') await this.fieldRemoveRequest(client, interaction, id)
    else if (type == 'fieldeditlist') await this.fieldEditListRequest(client, interaction, id)
  }

  public async modalResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction): Promise<void> {
    const parts = interaction.customId.toLowerCase().split('-')
    const type = parts[2]
    const id = parts[1]

    if (type == 'content') await this.contentResponse(client, interaction, id)
    else if (type == 'embed') await this.embedResponse(client, interaction, id)
    else if (type == 'title') await this.titleResponse(client, interaction, id)
    else if (type == 'author') await this.authorResponse(client, interaction, id)
    else if (type == 'footer') await this.footerResponse(client, interaction, id)
    else if (type == 'fieldadd') await this.fieldAddResponse(client, interaction, id)
    else if (type == 'fieldedit') await this.fieldEditResponse(client, interaction, id, `${parts[parts.length - 2]}-${parts[parts.length - 1]}`)
  }

  public async selectResponse(client: NoirClient, interaction: SelectMenuInteraction): Promise<void> {
    const parts = interaction.customId.toLowerCase().split('-')
    const type = parts[2]
    const id = parts[1]

    if (type == 'fieldremove') await this.fieldRemoveResponse(client, interaction, id)
    else if (type == 'fieldeditlist') await this.fieldEditRequest(client, interaction, id, interaction.values[0])
  }

  private async contentRequest(client: NoirClient, interaction: ButtonInteraction, id: string): Promise<void> {
    const message = client.noirMessages.get(id)
    const contentInput = new TextInputBuilder()
      .setCustomId(this.generateInputId(id, 'content'))
      .setStyle(TextInputStyle.Paragraph)
      .setLabel('Message content')
      .setValue(message?.content ?? '')
      .setPlaceholder('Enter message content')
      .setRequired(true)
      .setMaxLength(2000)

    const actionRows = new ActionRowBuilder<ModalActionRowComponentBuilder>()
      .addComponents([contentInput])

    const modal = new ModalBuilder()
      .setCustomId(`message-${id}-content-modal`)
      .setTitle('Message content builder')
      .addComponents([actionRows])

    await interaction.showModal(modal)
  }

  private async contentResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string): Promise<void> {
    const content = interaction.fields.getTextInputValue(this.generateInputId(id, 'content'))

    client.noirMessages.get(id)?.setContent(content)

    await this.message(client, interaction, id)
  }

  private async embedRequest(client: NoirClient, interaction: ButtonInteraction, id: string): Promise<void> {
    const message = client.noirMessages.get(id)
    const colorInput = new TextInputBuilder()
      .setCustomId(this.generateInputId(id, 'color'))
      .setStyle(TextInputStyle.Short)
      .setLabel('Embed color')
      .setValue(message?.color ?? '')
      .setPlaceholder('Primary, secondary, tertiary, success, warning, embed')
      .setRequired(false)
      .setMaxLength(10)
    const descriptionInput = new TextInputBuilder()
      .setCustomId(this.generateInputId(id, 'description'))
      .setStyle(TextInputStyle.Paragraph)
      .setLabel('Embed description')
      .setValue(message?.description ?? '')
      .setPlaceholder('Enter the description')
      .setRequired(false)
      .setMaxLength(2000)
    const imageInput = new TextInputBuilder()
      .setCustomId(this.generateInputId(id, 'image'))
      .setStyle(TextInputStyle.Short)
      .setLabel('Embed image')
      .setValue(message?.image ?? '')
      .setPlaceholder('Url, server, user, client or leave blank')
      .setRequired(false)
      .setMaxLength(2000)
    const thumbnailInput = new TextInputBuilder()
      .setCustomId(this.generateInputId(id, 'thumbnail'))
      .setStyle(TextInputStyle.Short)
      .setLabel('Embed thumbnail')
      .setValue(message?.thumbnail ?? '')
      .setPlaceholder('Url, server, user, client or leave blank')
      .setRequired(false)
      .setMaxLength(2000)
    const timestampInput = new TextInputBuilder()
      .setCustomId(this.generateInputId(id, 'timestamp'))
      .setStyle(TextInputStyle.Short)
      .setLabel('Embed timestamp')
      .setValue(message?.timestamp ? 'true' : 'false' ?? '')
      .setPlaceholder('True or leave blank')
      .setRequired(false)
      .setMaxLength(5)

    const actionRows = [
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents([colorInput]),
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents([descriptionInput]),
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents([imageInput]),
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents([thumbnailInput]),
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents([timestampInput])
    ]

    const modal = new ModalBuilder()
      .setCustomId(this.generateModalId(id, 'embed'))
      .setTitle('Embed settings')
      .addComponents(actionRows)
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
    if (timestamp) message?.setTimestamp(timestamp == 'true' ? true : false)

    await this.message(client, interaction, id)
  }

  private async titleRequest(client: NoirClient, interaction: ButtonInteraction, id: string): Promise<void> {
    const message = client.noirMessages.get(id)
    const titleInput = new TextInputBuilder()
      .setCustomId(this.generateInputId(id, 'title'))
      .setStyle(TextInputStyle.Short)
      .setLabel('Embed title')
      .setValue(message?.title.text ?? '')
      .setPlaceholder('Enter title text')
      .setRequired(true)
      .setMaxLength(2000)
    const titleURLInput = new TextInputBuilder()
      .setStyle(TextInputStyle.Short)
      .setCustomId(this.generateInputId(id, 'titleURL'))
      .setLabel('Embed url')
      .setValue(message?.url ?? '')
      .setPlaceholder('Enter title url')
      .setRequired(false)
      .setMaxLength(2000)

    const actionRows = [
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents([titleInput]),
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents([titleURLInput]),
    ]

    const modal = new ModalBuilder()
      .setCustomId(this.generateModalId(id, 'title'))
      .setTitle('Embed title builder')
      .addComponents(actionRows)
    await interaction.showModal(modal)
  }

  private async titleResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string): Promise<void> {
    const title = interaction.fields.getTextInputValue(`message-${id}-title-input`)
    const titleURL = interaction.fields.getTextInputValue(`message-${id}-titleURL-input`) ?? undefined

    client.noirMessages.get(id)?.setTitle(title, titleURL)

    await this.message(client, interaction, id)
  }

  private async authorRequest(client: NoirClient, interaction: ButtonInteraction, id: string): Promise<void> {
    const message = client.noirMessages.get(id)
    const authorInput = new TextInputBuilder()
      .setCustomId(this.generateInputId(id, 'author'))
      .setStyle(TextInputStyle.Short)
      .setLabel('Embed author')
      .setValue(message?.author?.text ?? '')
      .setPlaceholder('Enter author name')
      .setRequired(true)
      .setMaxLength(2000)
    const authorImageInput = new TextInputBuilder()
      .setCustomId(this.generateInputId(id, 'authorImage'))
      .setStyle(TextInputStyle.Short)
      .setLabel('Embed author image')
      .setValue(message?.author?.image ?? '')
      .setPlaceholder('Url, client, user, server or leave blank')
      .setRequired(false)
      .setMaxLength(2000)

    const actionRows = [
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents([authorInput]),
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents([authorImageInput])
    ]

    const modal = new ModalBuilder()
      .setCustomId(this.generateModalId(id, 'author'))
      .setTitle('Embed author builder')
      .addComponents(actionRows)
    await interaction.showModal(modal)
  }

  private async authorResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string): Promise<void> {
    const author = interaction.fields.getTextInputValue(this.generateInputId(id, 'author'))
    const authorImage = interaction.fields.getTextInputValue(this.generateInputId(id, 'authorImage'))

    client.noirMessages.get(id)?.setAuthor(author, authorImage)

    await this.message(client, interaction, id)
  }

  private async footerRequest(client: NoirClient, interaction: ButtonInteraction, id: string): Promise<void> {
    const message = client.noirMessages.get(id)
    const footerInput = new TextInputBuilder()
      .setCustomId(this.generateInputId(id, 'footer'))
      .setStyle(TextInputStyle.Short)
      .setLabel('Embed author')
      .setValue(message?.footer?.text ?? '')
      .setPlaceholder('Enter author text')
      .setRequired(true)
      .setMaxLength(2000)
    const footerImageInput = new TextInputBuilder()
      .setCustomId(this.generateInputId(id, 'footerImage'))
      .setStyle(TextInputStyle.Short)
      .setLabel('Embed author icon')
      .setValue(message?.footer?.image ?? '')
      .setPlaceholder('url, client, user, server or leave blank')
      .setRequired(false)
      .setMaxLength(2000)

    const actionRows = [
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents([footerInput]),
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents([footerImageInput])
    ]

    const modal = new ModalBuilder()
      .setCustomId(this.generateModalId(id, 'footer'))
      .setTitle('Embed footer builder')
      .addComponents(actionRows)
    await interaction.showModal(modal)
  }

  private async footerResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string): Promise<void> {
    const footer = interaction.fields.getTextInputValue(this.generateInputId(id, 'footer'))
    const footerImage = interaction.fields.getTextInputValue(this.generateInputId(id, 'footerImage'))

    client.noirMessages.get(id)?.setFooter(footer, footerImage)

    await this.message(client, interaction, id)
  }

  private async fieldAddRequest(client: NoirClient, interaction: ButtonInteraction, id: string): Promise<void> {
    const nameInput = new TextInputBuilder()
      .setCustomId(this.generateInputId(id, 'fieldName'))
      .setStyle(TextInputStyle.Short)
      .setLabel('Embed field name')
      .setPlaceholder('Enter field name')
      .setRequired(true)
      .setMaxLength(2000)
    const valueInput = new TextInputBuilder()
      .setCustomId(this.generateInputId(id, 'fieldValue'))
      .setStyle(TextInputStyle.Paragraph)
      .setLabel('Embed field value')
      .setPlaceholder('Enter field value')
      .setRequired(true)
      .setMaxLength(2000)
    const inlineInput = new TextInputBuilder()
      .setCustomId(this.generateInputId(id, 'fieldInline'))
      .setStyle(TextInputStyle.Short)
      .setLabel('Embed field inline')
      .setPlaceholder('True or leave blank')
      .setRequired(false)
      .setMaxLength(5)

    const actionRows = [
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents([nameInput]),
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents([valueInput]),
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents([inlineInput])
    ]

    const modal = new ModalBuilder()
      .setCustomId(this.generateModalId(id, 'fieldAdd'))
      .setTitle('Embed field builder')
      .addComponents(actionRows)
    await interaction.showModal(modal).catch(err => console.log(err))
  }

  private async fieldAddResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string): Promise<void> {
    const name = interaction.fields.getTextInputValue(this.generateInputId(id, 'fieldName'))
    const value = interaction.fields.getTextInputValue(this.generateInputId(id, 'fieldValue'))
    const inline = interaction.fields.getTextInputValue(this.generateInputId(id, 'fieldInline'))

    if (name && value && inline == 'true' || name && value) {
      client.noirMessages.get(id)?.addField({ name: name, value: value, inline: inline == 'true' ? true : false })
    }

    await this.message(client, interaction, id)
  }

  private async fieldRemoveRequest(client: NoirClient, interaction: ButtonInteraction, id: string): Promise<void> {
    const message = client.noirMessages.get(id)

    if (!message?.fields) return

    const selectMenu = new SelectMenuBuilder()
      .setCustomId(this.generateSelectId(id, 'fieldRemove'))
      .setPlaceholder('Choose field(s) to remove')
      .setMaxValues(message.fields.size)
      .setMinValues(1)

    message?.fields?.map(field => {
      selectMenu.addOptions([
        {
          label: field.name,
          description: 'Select to remove',
          value: `${this.editId(field.name) + '-' + this.editId(field.value)}`
        }
      ])
    })

    const actionRows = [
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(selectMenu),
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(this.backButton(id))
    ]

    try {
      await client.noirReply.reply({
        interaction: interaction,
        author: 'Embed field editor',
        description: 'Select field(s) to remove',
        color: colors.Primary,
        components: actionRows
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

    await this.message(client, interaction, id)
  }

  private async fieldEditListRequest(client: NoirClient, interaction: ButtonInteraction, id: string): Promise<void> {
    const message = client.noirMessages.get(id)

    if (!message?.fields) return

    const selectMenu = new SelectMenuBuilder()
      .setCustomId(this.generateSelectId(id, 'fieldEditList'))
      .setPlaceholder('Choose field to edit')
      .setMaxValues(message.fields.size)
      .setMinValues(1)
      .setMaxValues(1)

    message?.fields?.map(field => {
      selectMenu.addOptions([
        {
          label: field.name,
          description: 'Select to edit',
          value: `${this.editId(field.name)}-${this.editId(field.value)}`
        }
      ])
    })

    const actionRows = [
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(selectMenu),
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(this.backButton(id))
    ]

    try {
      await client.noirReply.reply({
        interaction: interaction,
        author: 'Embed fields edit',
        description: 'Select field(s) to edit',
        color: colors.Primary,
        components: actionRows
      })
    } catch {
      return
    }
  }

  private async fieldEditRequest(client: NoirClient, interaction: SelectMenuInteraction, id: string, fieldId: string): Promise<void> {
    const message = client.noirMessages.get(id)
    const fieldName = new TextInputBuilder()
      .setCustomId(this.generateInputId(id, 'fieldName'))
      .setStyle(TextInputStyle.Short)
      .setLabel('Embed field name')
      .setValue(message?.fields?.get(fieldId)?.name ?? '')
      .setPlaceholder('Enter field name')
      .setRequired(false)
      .setMaxLength(2000)
    const fieldValue = new TextInputBuilder()
      .setCustomId(this.generateInputId(id, 'fieldValue'))
      .setStyle(TextInputStyle.Paragraph)
      .setLabel('Embed field value')
      .setValue(message?.fields?.get(fieldId)?.value ?? '')
      .setPlaceholder('Enter field value')
      .setRequired(false)
      .setMaxLength(2000)
    const fieldInline = new TextInputBuilder()
      .setCustomId(this.generateInputId(id, 'fieldInline'))
      .setStyle(TextInputStyle.Short)
      .setLabel('Field inline')
      .setValue(message?.fields?.get(fieldId)?.inline ? 'true' : 'false' ?? '')
      .setPlaceholder('True or leave blank')
      .setRequired(false)
      .setMaxLength(2000)

    const actionRows = [
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents([fieldName]),
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents([fieldValue]),
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents([fieldInline])
    ]

    const modal = new ModalBuilder()
      .setCustomId(this.generateModalId(id, 'fieldEdit') + `-${this.editId(message?.fields?.get(fieldId)?.name)}-${this.editId(message?.fields?.get(fieldId)?.value)}`)
      .setTitle('Embed field editor')
      .addComponents(actionRows)
    await interaction.showModal(modal)
  }

  private async fieldEditResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string, oldId: string): Promise<void> {
    const name = interaction.fields.getTextInputValue(this.generateInputId(id, 'fieldName'))
    const value = interaction.fields.getTextInputValue(this.generateInputId(id, 'fieldValue'))
    const inline = interaction.fields.getTextInputValue(this.generateInputId(id, 'fieldInline'))

    if (name && value && inline == 'true' || name && value && inline == 'false') {
      client.noirMessages.get(id)?.editField(oldId, { name: name, value: value, inline: inline == 'true' ? true : false })
    }

    await this.message(client, interaction, id)
  }
}