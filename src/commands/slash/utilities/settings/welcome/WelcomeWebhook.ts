import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ChannelType, MessageActionRowComponentBuilder, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, TextChannel, TextInputBuilder, TextInputStyle } from 'discord.js'
import Colors from '../../../../../constants/Colors'
import Options from '../../../../../constants/Options'
import NoirClient from '../../../../../structures/Client'
import SettingsUtils from '../SettingsUtils'
import WelcomeSettings from './WelcomeSettings'

export default class WelcomeWebhook {
  public static async initialMessage(client: NoirClient, interaction: ButtonInteraction | ModalMessageModalSubmitInteraction, id: string) {
    const welcomeModel = client.welcomeSettings.get(id)
    const welcomeWebhook = await welcomeModel?.getWebhook(client)
    let welcomeData = welcomeModel?.data

    if (!welcomeData) {
      welcomeData = await WelcomeSettings.generateCache(client, id)
    }

    if (!welcomeData) return

    const buttons = [
      [
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeWebhookChannel', 'button'))
          .setLabel(`${welcomeData?.webhook ? 'Change' : 'Setup'} welcome channel`)
          .setStyle(SettingsUtils.generateStyle(welcomeData?.webhook))
          .setDisabled(!welcomeData?.status),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeWebhookEdit', 'button'))
          .setLabel('Edit webhook settings')
          .setStyle(SettingsUtils.defaultStyle)
          .setDisabled(!welcomeData?.status || !welcomeModel?.getWebhook(client) || !welcomeWebhook)
      ],
      [
        SettingsUtils.generateBack('settings', id, 'welcomeBack'),
        SettingsUtils.generateSave('settings', id, 'welcomeSave.welcomeWebhook'),
        SettingsUtils.generateRestore('settings', id, 'welcomeRestore.welcomeWebhook')
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
      description: 'Setup custom webhook for auto-message.',
      fields: [
        {
          name: 'Image variables',
          value: '`{{client avatar}}` Client avatar\n`{{guild icon}}` Server icon',
          inline: false,
        }
      ],
      components: actionRows,
      ephemeral: true,
    })
  }

  public static async channelRequest(client: NoirClient, interaction: ButtonInteraction, id: string) {
    const welcomeData = client.welcomeSettings.get(id)
    const webhook = await welcomeData?.getWebhook(client)

    const channelInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeWebhookChannel', 'input'))
      .setLabel('Channel id')
      .setPlaceholder('Enter the channel id')
      .setValue(webhook?.channelId ?? '')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)

    const actionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>()
      .addComponents(channelInput)
    const modal = new ModalBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeWebhookChannel', 'modal'))
      .setTitle(`${webhook?.channelId ? 'Change' : 'Setup'} channel`)
      .addComponents(actionRow)

    await interaction.showModal(modal)
  }

  public static async editRequest(client: NoirClient, interaction: ButtonInteraction, id: string) {
    const welcomeData = client.welcomeSettings.get(id)
    const webhook = await welcomeData?.getWebhook(client)

    const webhookNameInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeWebhookName', 'input'))
      .setLabel('Webhook name')
      .setPlaceholder('Enter new webhook name')
      .setValue(webhook?.name ?? '')
      .setStyle(TextInputStyle.Short)
      .setRequired(false)
    const webhookAvatarInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeWebhookAvatar', 'input'))
      .setLabel('Webhook avatar')
      .setPlaceholder('Enter new webhook avatar URL or use variables')
      .setValue(welcomeData?.data.rawWebhookAvatar ?? '')
      .setStyle(TextInputStyle.Short)
      .setRequired(false)

    const actionRows = [
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(webhookNameInput),
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(webhookAvatarInput)
    ]

    const modal = new ModalBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeWebhookEdit', 'modal'))
      .setTitle('Welcome webhook editor')
      .addComponents(actionRows)

    await interaction.showModal(modal)
  }

  public static async channelResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string) {
    const welcomeModel = client.welcomeSettings.get(id)
    let welcomeData = welcomeModel?.data
    const channelId = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'welcomeWebhookChannel', 'input'))

    if (!welcomeData) {
      welcomeData = await WelcomeSettings.generateCache(client, id)
    }

    if (!welcomeData || !channelId) return

    const channel = client.channels.cache.get(channelId) as TextChannel

    if (!channel) return
    if (channel.type != ChannelType.GuildText) return

    const webhook = await welcomeModel?.getWebhook(client)

    if (!webhook) {
      const updatedWebhook = await channel.createWebhook({
        name: 'Noir welcome',
        avatar: Options.clientAvatar
      })

      welcomeData.webhook = updatedWebhook.url
    }

    else {
      const updatedWebhook = await webhook.edit({
        channel: channel.id
      })

      welcomeData.webhook = updatedWebhook.url
    }

    await this.initialMessage(client, interaction, id)
  }

  public static async editResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string) {
    const welcomeModel = client.welcomeSettings.get(id)
    let welcomeData = welcomeModel?.data
    const webhookName = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'welcomeWebhookName', 'input'))
    const webhookAvatar = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'welcomeWebhookAvatar', 'input'))

    if (!welcomeData) {
      welcomeData = await WelcomeSettings.generateCache(client, id)
    }

    if (!welcomeData) return

    const webhook = await welcomeModel?.getWebhook(client)

    if (!webhook) return

    if (webhookAvatar) {
      welcomeData.rawWebhookAvatar = webhookAvatar
    }

    await webhook.edit({
      name: webhookName ?? webhook.name,
      avatar: SettingsUtils.formatImage(client, interaction, webhookAvatar) ?? webhook.avatarURL()
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

    else if (method == 'welcomeWebhookEdit') {
      await WelcomeWebhook.editRequest(client, interaction, id)
    }
  }

  public static async modalResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string, method: string) {
    if (method == 'welcomeWebhookChannel') {
      await WelcomeWebhook.channelResponse(client, interaction, id)
    }

    else if (method == 'welcomeWebhookEdit') {
      await WelcomeWebhook.editResponse(client, interaction, id)
    }
  }
}