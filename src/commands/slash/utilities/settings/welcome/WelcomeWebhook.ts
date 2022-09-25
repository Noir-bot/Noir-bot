import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ChannelType, MessageActionRowComponentBuilder, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, TextChannel, TextInputBuilder, TextInputStyle } from 'discord.js'
import Colors from '../../../../../constants/Colors'
import Options from '../../../../../constants/Options'
import NoirClient from '../../../../../structures/Client'

export default class WelcomeWebhook {
  public static async initialMessage(client: NoirClient, interaction: ButtonInteraction | ModalMessageModalSubmitInteraction, id: string) {
    const welcomeData = client.welcomeSettings.get(id)
    const welcomeWebhook = await welcomeData?.getWebhook(client)

    const buttons = [
      [
        new ButtonBuilder()
          .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeWebhookChannel', 'button'))
          .setLabel(`${welcomeData?.data.channel ? 'Change' : 'Set'} welcome channel`)
          .setStyle(client.componentsUtils.generateStyle(welcomeData?.data.channel))
          .setDisabled(!welcomeData?.data.status),
        new ButtonBuilder()
          .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeWebhookAvatar', 'button'))
          .setLabel('Change webhook avatar')
          .setStyle(client.componentsUtils.defaultStyle)
          .setDisabled(!welcomeData?.data.status || !welcomeWebhook),
        new ButtonBuilder()
          .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeWebhookUsername', 'button'))
          .setLabel('Change webhook username')
          .setStyle(client.componentsUtils.defaultStyle)
          .setDisabled(!welcomeData?.data.status || !welcomeWebhook)
      ],
      [
        client.componentsUtils.generateBack('settings', id, 'welcomeBack'),
        client.componentsUtils.generateSave('settings', id, 'welcomeSave.welcomeWebhook'),
        client.componentsUtils.generateRestore('settings', id, 'welcomeRestore.welcomeWebhook')
      ]
    ]

    const actionRows = [
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[0]),
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[1])
    ]

    await client.reply.reply({
      interaction: interaction,
      color: Colors.primary,
      author: 'Welcome webhook settings',
      authorImage: Options.clientAvatar,
      description: 'Welcome auto-message channel editor. Setup custom webhook for welcome messages.',
      components: actionRows,
      ephemeral: true,
    })
  }

  public static async channelRequest(client: NoirClient, interaction: ButtonInteraction, id: string) {
    const welcomeData = client.welcomeSettings.get(id)

    const channelInput = new TextInputBuilder()
      .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeWebhookChannel', 'input'))
      .setLabel('Channel id')
      .setPlaceholder(`Enter the channel id to ${welcomeData?.data.channel ? 'change' : 'add'}`)
      .setStyle(TextInputStyle.Short)
      .setRequired(true)

    const actionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>()
      .addComponents(channelInput)
    const modal = new ModalBuilder()
      .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeWebhookChannel', 'modal'))
      .setTitle('Welcome channel settings')
      .addComponents(actionRow)

    await interaction.showModal(modal)
  }

  public static async avatarRequest(client: NoirClient, interaction: ButtonInteraction, id: string) {
    const welcomeData = client.welcomeSettings.get(id)

    const channelInput = new TextInputBuilder()
      .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeWebhookAvatar', 'input'))
      .setLabel('Avatar variable')
      .setPlaceholder(`Image URL or server, user, client`)
      .setStyle(TextInputStyle.Short)
      .setRequired(true)

    const actionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>()
      .addComponents(channelInput)
    const modal = new ModalBuilder()
      .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeWebhookAvatar', 'modal'))
      .setTitle('Welcome webhook avatar settings')
      .addComponents(actionRow)

    await interaction.showModal(modal)
  }

  public static async usernameRequest(client: NoirClient, interaction: ButtonInteraction, id: string) {
    const welcomeData = client.welcomeSettings.get(id)

    const channelInput = new TextInputBuilder()
      .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeWebhookUsername', 'input'))
      .setLabel('Username]')
      .setPlaceholder(`Image URL or server, user, client`)
      .setStyle(TextInputStyle.Short)
      .setRequired(true)

    const actionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>()
      .addComponents(channelInput)
    const modal = new ModalBuilder()
      .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeWebhookUsername', 'modal'))
      .setTitle('Welcome webhook avatar settings')
      .addComponents(actionRow)

    await interaction.showModal(modal)
  }

  public static async channelResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string) {
    const welcomeData = client.welcomeSettings.get(id)
    const newChannel = client.channels.cache.get(interaction.fields.getTextInputValue(client.componentsUtils.generateId('settings', id, 'welcomeWebhookChannel', 'input')))

    if (!newChannel) return
    if (newChannel?.type != ChannelType.GuildText) return

    const oldChannel = client.channels.cache.get(welcomeData?.data.channel ?? '') as TextChannel

    if (newChannel == oldChannel) return

    if (oldChannel) {
      const oldWebhook = (await oldChannel.fetchWebhooks()).get(welcomeData?.data.webhook ?? '')

      if (oldWebhook) {
        const newWebhook = await oldWebhook.edit({
          channel: newChannel.id
        })

        if (!welcomeData) return

        welcomeData.data.webhook = newWebhook.id
        welcomeData.data.channel = newChannel.id
      } else {
        const newWebhook = await newChannel.createWebhook({
          name: 'Noir welcome',
          avatar: Options.clientAvatar
        })

        if (!welcomeData) return

        welcomeData.data.webhook = newWebhook.id
        welcomeData.data.channel = newChannel.id
      }
    } else {
      const newWebhook = await newChannel.createWebhook({
        name: 'Noir welcome',
        avatar: Options.clientAvatar
      })

      if (!welcomeData) return

      welcomeData.data.webhook = newWebhook.id
      welcomeData.data.channel = newChannel.id
    }

    await this.initialMessage(client, interaction, id)
  }

  public static async avatarResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string) {
    const welcomeData = client.welcomeSettings.get(id)
    const rawAvatar = client.utils.removeFormatValue(interaction.fields.getTextInputValue(client.componentsUtils.generateId('settings', id, 'welcomeWebhookAvatar', 'input')))
    const avatar = client.utils.formatImage(interaction, rawAvatar)
    const webhook = await welcomeData?.getWebhook(client)

    if (!avatar) return

    await webhook?.edit({
      avatar: avatar ?? Options.clientAvatar
    })

    await this.initialMessage(client, interaction, id)
  }

  public static async usernameResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string) {
    const welcomeData = client.welcomeSettings.get(id)
    const username = client.utils.removeFormatValue(interaction.fields.getTextInputValue(client.componentsUtils.generateId('settings', id, 'welcomeWebhookUsername', 'input')))
    const webhook = await welcomeData?.getWebhook(client)

    if (!username) return

    await webhook?.edit({
      name: username ?? 'Noir welcome'
    })

    await this.initialMessage(client, interaction, id)
  }

  public static async buttonResponse(client: NoirClient, interaction: ButtonInteraction, id: string, method: string) {
    if (method == 'welcomeWebhook') {
      await WelcomeWebhook.initialMessage(client, interaction, id)
    }

    else if (method == 'welcomeWebhookChannel') {
      await WelcomeWebhook.channelRequest(client, interaction, id)
    }

    else if (method == 'welcomeWebhookAvatar') {
      await WelcomeWebhook.avatarRequest(client, interaction, id)
    }

    else if (method == 'welcomeWebhookUsername') {
      await WelcomeWebhook.usernameRequest(client, interaction, id)
    }
  }

  public static async modalResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string, method: string) {
    if (method == 'welcomeWebhookChannel') {
      await WelcomeWebhook.channelResponse(client, interaction, id)
    }

    else if (method == 'welcomeWebhookAvatar') {
      await WelcomeWebhook.avatarResponse(client, interaction, id)
    }

    else if (method == 'welcomeWebhookUsername') {
      await WelcomeWebhook.usernameResponse(client, interaction, id)
    }
  }
}