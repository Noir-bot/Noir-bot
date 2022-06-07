import { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, MessageActionRowComponentBuilder, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'
import { colors } from '../../../libs/config/design'
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
        access: 'premium',
        type: 'private',
        status: true
      },
      {
        name: 'message',
        description: 'Send message from bot',
        type: ApplicationCommandType.ChatInput
      }
    )
  }

  public async execute(client: NoirClient, interaction: ChatInputCommandInteraction | ButtonInteraction): Promise<void> {
    const id = `${interaction.user.id}${interaction.guild?.id}`

    if (!client.noirMessages.get(id)) {
      client.noirMessages.set(id, new NoirMessage(id, client, interaction))
    }

    await this.message(client, interaction, id)
  }

  public async message(client: NoirClient, interaction: ChatInputCommandInteraction | ButtonInteraction | ModalMessageModalSubmitInteraction, id: string): Promise<void> {
    const message = client.noirMessages.get(id)
    const successStyle = ButtonStyle.Success
    const unsuccessStyle = ButtonStyle.Secondary

    const generateButton = (type: string): string => {
      return `message-${id}-${type}-button`
    }

    const generateStyle = <type = boolean | string>(status: type): ButtonStyle => {
      return status ? successStyle : unsuccessStyle
    }

    const buttons = [
      [
        new ButtonBuilder()
          .setLabel('Embed settings')
          .setCustomId(generateButton('embed'))
          .setStyle(generateStyle(message?.status)),
        new ButtonBuilder()
          .setLabel('Embed author')
          .setCustomId(generateButton('author'))
          .setStyle(generateStyle(message?.author.text)),
        new ButtonBuilder()
          .setLabel('Embed title')
          .setCustomId(generateButton('title'))
          .setStyle(generateStyle(message?.title.text)),
        new ButtonBuilder()
          .setLabel('Embed footer')
          .setCustomId(generateButton('footer'))
          .setStyle(generateStyle(message?.footer.text))
      ],
      [
        new ButtonBuilder()
          .setLabel('Add embed field')
          .setCustomId(generateButton('fieldAdd'))
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setLabel('Remove embed fields')
          .setCustomId(generateButton('fieldRemove'))
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setLabel('Edit embed fields')
          .setCustomId(generateButton('fieldEdit'))
          .setStyle(ButtonStyle.Secondary)
      ],
      [
        new ButtonBuilder()
          .setLabel('Reset')
          .setCustomId(generateButton('reset'))
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setLabel('Cancel')
          .setCustomId(generateButton('cancel'))
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setLabel('Send message')
          .setCustomId(generateButton('send'))
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setLabel('Message content')
          .setCustomId(generateButton('content'))
          .setStyle(generateStyle(message?.content))
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
      author: 'Message constructor',
      description: 'Use buttons bellow to setup the message content',
      components: actionRows,
      footer: 'Created by Loid',
      fetch: true,
    })
  }

  public async buttonResponse(client: NoirClient, interaction: ButtonInteraction): Promise<void> {
    const parts = interaction.customId.toLowerCase().split('-')
    const type = parts[2]
    const id = parts[1]

    if (type == 'cancel') {
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
        else if (!status && content) {
          await interaction.channel?.send({ content: content })
          console.log(content)
        }

        this.message(client, interaction, id)
      } catch (err) {
        await client.noirReply.reply({
          interaction: interaction,
          author: 'Unexpected error',
          description: 'Can\'t send empty message',
          color: colors.Warning
        })
      }
    } else if (type == 'content') await this.contentRequest(client, interaction, id)
    else if (type == 'embed') await this.embedRequest(client, interaction, id)
    else if (type == 'title') await this.titleRequest(client, interaction, id)
    else if (type == 'author') await this.authorRequest(client, interaction, id)
    else if (type == 'footer') await this.footerRequest(client, interaction, id)
    else if (type == 'fieldAdd') await this.fieldAddRequest(client, interaction, id)
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
    else if (type == 'fieldAdd') await this.fieldAddResponse(client, interaction, id)
  }

  public generateInputId(id: string, type: string): string {
    return `message-${id}-${type}-input`
  }

  public generateModalId(id: string, type: string): string {
    return `message-${id}-${type}-modal`
  }

  public async contentRequest(client: NoirClient, interaction: ButtonInteraction, id: string): Promise<void> {
    const message = client.noirMessages.get(id)
    const contentInput = new TextInputBuilder()
      .setCustomId(this.generateInputId(id, 'content'))
      .setStyle(TextInputStyle.Paragraph)
      .setLabel('Message content')
      .setValue(message?.content ?? '')
      .setPlaceholder('Enter message content here')
      .setRequired(true)
      .setMaxLength(2000)

    const contentActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>()
      .addComponents([contentInput])

    const modal = new ModalBuilder()
      .setCustomId(`message-${id}-content-modal`)
      .setTitle('Message content constructor')
      .addComponents([contentActionRow])

    await interaction.showModal(modal)
  }

  public async contentResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string): Promise<void> {
    const content = interaction.fields.getTextInputValue(this.generateInputId(id, 'content'))

    client.noirMessages.get(id)?.setContent(content)

    await this.message(client, interaction, id)
  }

  public async embedRequest(client: NoirClient, interaction: ButtonInteraction, id: string): Promise<void> {
    const message = client.noirMessages.get(id)
    const colorInput = new TextInputBuilder()
      .setCustomId(this.generateInputId(id, 'color'))
      .setStyle(TextInputStyle.Short)
      .setLabel('Embed color')
      .setValue(message?.color ?? '')
      .setPlaceholder('Enter embed color (primary, secondary, tertiary, success, warning, embed)')
      .setRequired(false)
      .setMaxLength(20)
    const descriptionInput = new TextInputBuilder()
      .setCustomId(this.generateInputId(id, 'description'))
      .setStyle(TextInputStyle.Paragraph)
      .setLabel('Embed description')
      .setValue(message?.description ?? '')
      .setPlaceholder('Enter embed description')
      .setRequired(false)
      .setMaxLength(2000)
    const imageInput = new TextInputBuilder()
      .setCustomId(this.generateInputId(id, 'image'))
      .setStyle(TextInputStyle.Short)
      .setLabel('Embed image')
      .setValue(message?.image ?? '')
      .setPlaceholder('Enter embed image (server, user, client)')
      .setRequired(false)
      .setMaxLength(2000)
    const thumbnailInput = new TextInputBuilder()
      .setCustomId(this.generateInputId(id, 'thumbnail'))
      .setStyle(TextInputStyle.Short)
      .setLabel('Embed thumbnail')
      .setValue(message?.thumbnail ?? '')
      .setPlaceholder('Enter embed thumbnail (server, user, client)')
      .setRequired(false)
      .setMaxLength(2000)

    const embedActionRows = [
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents([colorInput]),
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents([descriptionInput]),
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents([imageInput]),
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents([thumbnailInput])
    ]

    const modal = new ModalBuilder()
      .setCustomId(this.generateModalId(id, 'embed'))
      .setTitle('Embed constructor')
      .addComponents(embedActionRows)
    await interaction.showModal(modal)
  }

  public async embedResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string): Promise<void> {
    const message = client.noirMessages.get(id)
    const color = interaction.fields.getTextInputValue(this.generateInputId(id, 'color'))
    const description = interaction.fields.getTextInputValue(this.generateInputId(id, 'description'))
    const thumbnail = interaction.fields.getTextInputValue(this.generateInputId(id, 'thumbnail'))
    const image = interaction.fields.getTextInputValue(this.generateInputId(id, 'image'))

    if (color) message?.setColor(color)
    if (description) message?.setDescription(description)
    if (thumbnail) message?.setThumbnail(thumbnail)
    if (image) message?.setImage(image)

    await this.message(client, interaction, id)
  }

  public async titleRequest(client: NoirClient, interaction: ButtonInteraction, id: string): Promise<void> {
    const message = client.noirMessages.get(id)
    const titleInput = new TextInputBuilder()
      .setCustomId(this.generateInputId(id, 'title'))
      .setStyle(TextInputStyle.Short)
      .setLabel('Embed title')
      .setValue(message?.title.text ?? '')
      .setPlaceholder('Enter embed title')
      .setRequired(true)
      .setMaxLength(2000)
    const titleURLInput = new TextInputBuilder()
      .setStyle(TextInputStyle.Short)
      .setCustomId(this.generateInputId(id, 'titleURL'))
      .setLabel('Embed url')
      .setValue(message?.url ?? '')
      .setPlaceholder('Enter embed url')
      .setRequired(false)
      .setMaxLength(2000)

    const titleActionRows = [
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents([titleInput]),
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents([titleURLInput]),
    ]

    const modal = new ModalBuilder()
      .setCustomId(this.generateModalId(id, 'title'))
      .setTitle('Title constructor')
      .addComponents(titleActionRows)
    await interaction.showModal(modal)
  }

  public async titleResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string): Promise<void> {
    const title = interaction.fields.getTextInputValue(`message-${id}-title-input`)
    const titleURL = interaction.fields.getTextInputValue(`message-${id}-titleURL-input`) ?? undefined

    client.noirMessages.get(id)?.setTitle(title, titleURL)

    await this.message(client, interaction, id)
  }

  public async authorRequest(client: NoirClient, interaction: ButtonInteraction, id: string): Promise<void> {
    const message = client.noirMessages.get(id)
    const authorInput = new TextInputBuilder()
      .setCustomId(this.generateInputId(id, 'author'))
      .setStyle(TextInputStyle.Short)
      .setLabel('Embed author')
      .setValue(message?.author?.text ?? '')
      .setPlaceholder('Enter embed author')
      .setRequired(true)
      .setMaxLength(2000)
    const authorImageInput = new TextInputBuilder()
      .setCustomId(this.generateInputId(id, 'authorImage'))
      .setStyle(TextInputStyle.Short)
      .setLabel('Embed author image')
      .setValue(message?.author?.image ?? '')
      .setPlaceholder('Enter embed author image url (client, user, server)')
      .setRequired(false)
      .setMaxLength(2000)

    const authorActionRows = [
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents([authorInput]),
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents([authorImageInput])
    ]

    const modal = new ModalBuilder()
      .setCustomId(this.generateModalId(id, 'author'))
      .setTitle('Author constructor')
      .addComponents(authorActionRows)
    await interaction.showModal(modal)
  }

  public async authorResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string): Promise<void> {
    const author = interaction.fields.getTextInputValue(this.generateInputId(id, 'author'))
    const authorImage = interaction.fields.getTextInputValue(this.generateInputId(id, 'authorImage'))

    client.noirMessages.get(id)?.setAuthor(author, authorImage)

    await this.message(client, interaction, id)
  }

  public async footerRequest(client: NoirClient, interaction: ButtonInteraction, id: string): Promise<void> {
    const message = client.noirMessages.get(id)
    const footerInput = new TextInputBuilder()
      .setStyle(TextInputStyle.Short)
      .setCustomId(this.generateInputId(id, 'footer'))
      .setLabel('Embed author')
      .setValue(message?.footer?.text ?? '')
      .setPlaceholder('Enter embed footer')
      .setRequired(true)
      .setMaxLength(2000)
    const footerImageInput = new TextInputBuilder()
      .setStyle(TextInputStyle.Short)
      .setCustomId(this.generateInputId(id, 'footerImage'))
      .setLabel('Embed author icon')
      .setValue(message?.footer?.image ?? '')
      .setPlaceholder('Enter embed footer icon url (client, user, server)')
      .setRequired(false)
      .setMaxLength(2000)

    const footerActionRows = [
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents([footerInput]),
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents([footerImageInput])
    ]

    const modal = new ModalBuilder()
      .setCustomId(this.generateModalId(id, 'footer'))
      .setTitle('Footer constructor')
      .addComponents(footerActionRows)
    await interaction.showModal(modal)
  }

  public async footerResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string): Promise<void> {
    const footer = interaction.fields.getTextInputValue(this.generateInputId(id, 'footer'))
    const footerImage = interaction.fields.getTextInputValue(this.generateInputId(id, 'footerImage'))

    client.noirMessages.get(id)?.setFooter(footer, footerImage)

    await this.message(client, interaction, id)
  }

  public async fieldAddRequest(client: NoirClient, interaction: ButtonInteraction, id: string): Promise<void> {
    const nameInput = new TextInputBuilder()
      .setStyle(TextInputStyle.Short)
      .setCustomId(this.generateInputId(id, 'fieldName'))
      .setLabel('Field name')
      .setPlaceholder('Enter field name')
      .setRequired(true)
      .setMaxLength(2000)
    const valueInput = new TextInputBuilder()
      .setStyle(TextInputStyle.Paragraph)
      .setCustomId(this.generateInputId(id, 'fieldValue'))
      .setLabel('Field value')
      .setPlaceholder('Enter field value')
      .setRequired(true)
      .setMaxLength(2000)
    const inlineInput = new TextInputBuilder()
      .setStyle(TextInputStyle.Short)
      .setCustomId(this.generateInputId(id, 'fieldInline'))
      .setLabel('Field name')
      .setPlaceholder('Enter field inline (true or false)')
      .setMaxLength(5)

    const fieldActionRows = [
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents([nameInput]),
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents([valueInput]),
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents([inlineInput])
    ]

    const modal = new ModalBuilder()
      .setCustomId(this.generateModalId(id, 'fieldAdd'))
      .setTitle('Field constructor')
      .addComponents(fieldActionRows)
    await interaction.showModal(modal)
  }

  public async fieldAddResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string): Promise<void> {
    const name = interaction.fields.getTextInputValue(this.generateInputId(id, 'fieldName'))
    const value = interaction.fields.getTextInputValue(this.generateInputId(id, 'fieldValue'))
    const inline = interaction.fields.getTextInputValue(this.generateInputId(id, 'fieldInline'))

    if (name && value && inline == 'true' || name && value) {
      client.noirMessages.get(id)?.addField({ name: name, value: value, inline: inline == 'true' ? true : false })
    }

    await this.message(client, interaction, id)
  }
}