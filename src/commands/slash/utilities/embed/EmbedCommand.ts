import { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, MessageActionRowComponentBuilder, ModalMessageModalSubmitInteraction, SelectMenuInteraction } from 'discord.js'
import EmbedConstructor from '../../../../collections/EmbedConstructor'
import Colors from '../../../../constants/Colors'
import Options from '../../../../constants/Options'
import NoirClient from '../../../../structures/Client'
import ChatCommand from '../../../../structures/commands/ChatCommand'
import EmbedCommandComponents from './EmbedCommandComponents'
import EmbedCommandUtils from './EmbedCommandUtils'

export default class EmbedCommand extends ChatCommand {
  constructor(client: NoirClient) {
    super(
      client,
      {
        permissions: ['SendMessages', 'EmbedLinks'],
        access: 'public',
        type: 'public',
        status: true
      },
      {
        name: 'embed',
        description: 'Send custom embed message',
        nameLocalizations: { ru: 'ембед' },
        descriptionLocalizations: { ru: 'Отправить кастомное ембед сообщение' },
        defaultMemberPermissions: ['ManageMessages', 'EmbedLinks'],
        type: ApplicationCommandType.ChatInput,
        dmPermission: false,
      }
    )
  }

  public async execute(client: NoirClient, interaction: ChatInputCommandInteraction | ButtonInteraction): Promise<void> {
    const id = `${interaction.user.id}${interaction.guild?.id}`

    if (!client.embedConstructors.get(id)) {
      client.embedConstructors.set(id, new EmbedConstructor(id))
    }

    await EmbedCommand.initialMessage(client, interaction, id)
  }

  public static async initialMessage(client: NoirClient, interaction: ChatInputCommandInteraction | ButtonInteraction | ModalMessageModalSubmitInteraction | SelectMenuInteraction, id: string): Promise<void> {
    const premiumData = EmbedCommandUtils.getPremiumStatus(client, interaction.guild?.id)
    const messageData = client.embedConstructors.get(id)
    const fieldsLength = messageData?.data.embed.fields?.size ?? 0

    const buttons = [
      [
        new ButtonBuilder()
          .setCustomId(EmbedCommandUtils.generateComponentId(id, 'embed', 'button'))
          .setLabel('Embed settings')
          .setStyle(EmbedCommandUtils.generateButtonStyle(messageData?.data.embed.status)),
        new ButtonBuilder()
          .setCustomId(EmbedCommandUtils.generateComponentId(id, 'author', 'button'))
          .setLabel('Embed author')
          .setStyle(EmbedCommandUtils.generateButtonStyle(messageData?.data.embed.author)),
        new ButtonBuilder()
          .setCustomId(EmbedCommandUtils.generateComponentId(id, 'title', 'button'))
          .setLabel('Embed title')
          .setStyle(EmbedCommandUtils.generateButtonStyle(messageData?.data.embed.title)),
        new ButtonBuilder()
          .setCustomId(EmbedCommandUtils.generateComponentId(id, 'footer', 'button'))
          .setLabel('Embed footer')
          .setStyle(EmbedCommandUtils.generateButtonStyle(messageData?.data.embed.footer))
      ],
      [
        new ButtonBuilder()
          .setCustomId(EmbedCommandUtils.generateComponentId(id, 'fieldAdd', 'button'))
          .setLabel('Add embed field')
          .setStyle(EmbedCommandComponents.defaultButtonStyle)
          .setEmoji(Options.premiumEmoji)
          .setDisabled(fieldsLength >= 25 || !premiumData),
        new ButtonBuilder()
          .setCustomId(EmbedCommandUtils.generateComponentId(id, 'fieldRemove', 'button'))
          .setLabel('Remove embed fields')
          .setStyle(EmbedCommandComponents.defaultButtonStyle)
          .setEmoji(Options.premiumEmoji)
          .setDisabled(fieldsLength < 1 || !premiumData),
        new ButtonBuilder()
          .setCustomId(EmbedCommandUtils.generateComponentId(id, 'fieldEditList', 'button'))
          .setLabel('Edit embed fields')
          .setStyle(EmbedCommandComponents.defaultButtonStyle)
          .setEmoji(Options.premiumEmoji)
          .setDisabled(fieldsLength < 1 || !premiumData)
      ],
      [
        new ButtonBuilder()
          .setCustomId(EmbedCommandUtils.generateComponentId(id, 'reset', 'button'))
          .setLabel('Reset builder')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId(EmbedCommandUtils.generateComponentId(id, 'cancel', 'button'))
          .setLabel('Delete builder')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId(EmbedCommandUtils.generateComponentId(id, 'example', 'button'))
          .setLabel('Show example')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(EmbedCommandUtils.generateComponentId(id, 'send', 'button'))
          .setLabel('Send webhook')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(EmbedCommandUtils.generateComponentId(id, 'message', 'button'))
          .setLabel('Message content')
          .setStyle(EmbedCommandUtils.generateButtonStyle(messageData?.data.message))
      ]
    ]

    const actionRows = [
      new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(buttons[0]),
      new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(buttons[1]),
      new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(buttons[2])
    ]

    const fields = [
      {
        name: 'Premium features',
        value: `Some features are premium only. Premium features are marked with this emoji \`${Options.premiumEmoji}\``,
        inline: false
      },
      {
        name: 'Variables',
        value: `Enter \`${Options.removeValue}\` to delete value of the input. Some inputs contain variables, such as embed color, embed image etc`,
        inline: false
      },
      {
        name: 'Webhook settings',
        value: 'To change message author avatar and name go to channel settings, integrations and open the webhooks, find the webhook with the current name, now you can add avatar and change the webhook name',
        inline: false
      }
    ]

    await client.reply.reply({
      interaction: interaction,
      color: Colors.primary,
      author: 'Embed builder',
      description: 'Create your **custom and beautiful** embed message with our advanced embed message builder. Create various type of embed messages for **rules, instructions, announcements** and share with your awesome community!',
      authorImage: Options.clientAvatar,
      components: actionRows,
      fields: fields,
      fetch: true,
    })
  }
}
