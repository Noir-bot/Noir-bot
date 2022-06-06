import { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, MessageActionRowComponentBuilder, ModalActionRowComponentBuilder, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'
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
        access: 'private',
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
      client.noirMessages.set(id, new NoirMessage(id))
    }

    await this.controlMessage(client, interaction, id)
  }

  public async controlMessage(client: NoirClient, interaction: ChatInputCommandInteraction | ButtonInteraction | ModalSubmitInteraction, id: string) {
    const message = client.noirMessages.get(id)
    const embed = message?.embed

    const buttons = [
      [
        new ButtonBuilder().setCustomId(`message-${id}-content-button`).setLabel('Message content').setStyle(message?.content ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId(`message-${id}-color-button`).setLabel('Embed color').setStyle(embed?.data.color ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId(`message-${id}-image-button`).setLabel('Embed image').setStyle(embed?.data.image ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId(`message-${id}-thumbnail-button`).setLabel('Embed thumbnail').setStyle(embed?.data.thumbnail ? ButtonStyle.Success : ButtonStyle.Secondary)
      ],
      [
        new ButtonBuilder().setCustomId(`message-${id}-description-button`).setLabel('Embed description').setStyle(embed?.data.description ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId(`message-${id}-title-button`).setLabel('Embed title').setStyle(embed?.data.title ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId(`message-${id}-author-button`).setLabel('Embed author').setStyle(embed?.data.author?.name ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId(`message-${id}-footer-button`).setLabel('Embed footer').setStyle(embed?.data.footer?.text ? ButtonStyle.Success : ButtonStyle.Secondary)
      ],
      [
        new ButtonBuilder().setCustomId(`message-${id}-reset-button`).setLabel('Reset').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(`message-${id}-cancel-button`).setLabel('Cancel').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(`message-${id}-send-button`).setLabel('Send').setStyle(ButtonStyle.Success)

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

  public async buttonResponse(client: NoirClient, interaction: ButtonInteraction) {
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
      client.noirMessages.set(id, new NoirMessage(id))

      this.controlMessage(client, interaction, id)
    } else if (type == 'send') {
      const message = client.noirMessages.get(id)
      const embed = message?.embed.data
      const content = message?.content

      try {
        if (embed && content) await interaction.channel?.send({ embeds: [embed], content: content })
        else if (embed && !content) await interaction.channel?.send({ embeds: [embed] })
        else if (!embed && content) await interaction.channel?.send({ content: content })
      } catch (err) {
        client.noirReply.reply({
          interaction: interaction,
          author: 'Unexpected error',
          description: 'Can\'t send empty message',
          color: colors.Warning
        })
      }
    } else if (type == 'content') await this.contentRequest(client, interaction, id)
  }

  public async modalResponse(client: NoirClient, interaction: ModalSubmitInteraction) {
    const parts = interaction.customId.toLowerCase().split('-')
    const type = parts[2]
    const id = parts[1]

    if (type == 'content') await this.contentResponse(client, interaction, id)
  }

  public async contentRequest(client: NoirClient, interaction: ButtonInteraction, id: string) {
    const message = client.noirMessages.get(id)
    const contentInput = new TextInputBuilder()
      .setStyle(TextInputStyle.Paragraph)
      .setCustomId(`message-${id}-content-input`)
      .setLabel('Message content')
      .setRequired(true)
      .setMaxLength(2000)
      .setValue(message?.content ?? '')
      .setPlaceholder('Enter message content here')
    const contentActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents([contentInput])

    const modal = new ModalBuilder()
      .addComponents([contentActionRow])
      .setCustomId(`message-${id}-content-modal`)
      .setTitle('Message constructor, content')
    await interaction.showModal(modal)
  }

  public async contentResponse(client: NoirClient, interaction: ModalSubmitInteraction, id: string) {
    const content = interaction.fields.getTextInputValue(`message-${id}-content-input`)
    client.noirMessages.get(id)?.setContent(content)

    await this.controlMessage(client, interaction, id)
  }
}