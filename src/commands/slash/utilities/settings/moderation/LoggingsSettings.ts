import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ChannelType, MessageActionRowComponentBuilder, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, TextChannel, TextInputBuilder, TextInputStyle } from 'discord.js'
import Colors from '../../../../../constants/Colors'
import Options from '../../../../../constants/Options'
import NoirClient from '../../../../../structures/Client'
import ModerationCollection from '../collections/ModerationCollection'
import SettingsUtils from '../SettingsUtils'

export default class LoggingsSettings {
  public static async initialMessage(client: NoirClient, interaction: ButtonInteraction | ModalMessageModalSubmitInteraction, id: string) {
    let moderationData = client.moderationSettings.get(id)

    if (!moderationData) {
      client.moderationSettings.set(id, new ModerationCollection(id))
      moderationData = client.moderationSettings.get(id)
      await moderationData?.cacheData(client)
    }

    const buttons = [
      [
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, 'moderationLogsStatus', 'button'))
          .setLabel(`${moderationData?.data.logs.status ? 'Disable' : 'Enable'} logs messages`)
          .setStyle(SettingsUtils.generateStyle(moderationData?.data.logs.status)),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, 'moderationLogsChannel', 'button'))
          .setLabel(`${moderationData?.data.logs.webhook ? 'Change' : 'Setup'} channel`)
          .setStyle(SettingsUtils.generateStyle(moderationData?.data.logs.webhook))
          .setDisabled(!moderationData?.data.logs.status),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, 'moderationLogsWebhook', 'button'))
          .setLabel('Change webhook settings')
          .setStyle(SettingsUtils.defaultStyle)
          .setDisabled(!moderationData?.data.logs.status && !(await moderationData?.getWebhook(client)))
      ],
      [
        SettingsUtils.generateBack('settings', id, 'moderationBack'),
        SettingsUtils.generateSave('settings', id, 'moderationSave.loggings'),
        SettingsUtils.generateRestore('settings', id, 'moderationRestore.loggings')
      ]
    ]

    const actionRows = [
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[0]),
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[1])
    ]

    await client.reply.reply({
      interaction: interaction,
      color: Colors.primary,
      author: 'Loggings settings',
      authorImage: Options.clientAvatar,
      description: 'Setup channel and create webhook. Customize webhook as you want.',
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
    const moderationData = client.moderationSettings.get(id)

    const channelInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'moderationLogsChannel', 'input'))
      .setLabel('Channel id')
      .setPlaceholder('Enter the channel id')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)

    try {
      const webhook = await moderationData?.getWebhook(client)
      channelInput.setValue(webhook?.channelId ?? '')
    } catch { }

    const actionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>()
      .addComponents(channelInput)
    const modal = new ModalBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'moderationLogsChannel', 'modal'))
      .setTitle('Webhook settings')
      .addComponents(actionRow)

    await interaction.showModal(modal)
  }

  public static async channelResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string) {
    const moderationData = client.moderationSettings.get(id)
    const channelId = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'moderationLogsChannel', 'input'))

    if (!moderationData) return
    if (!channelId) return

    const channel = client.channels.cache.get(channelId) as TextChannel

    if (!channel) return
    if (channel.type != ChannelType.GuildText) return

    const webhook = await moderationData.getWebhook(client)

    if (!webhook) {
      const updatedWebhook = await channel.createWebhook({
        name: 'Noir logs',
        avatar: Options.clientAvatar
      })

      moderationData.data.logs.webhook = updatedWebhook.url
    }

    else {
      const updatedWebhook = await webhook.edit({
        channel: channel.id
      })

      moderationData.data.logs.webhook = updatedWebhook.url
    }

    await this.initialMessage(client, interaction, id)
  }

  public static async editRequest(client: NoirClient, interaction: ButtonInteraction, id: string) {
    const moderationData = client.moderationSettings.get(id)
    const webhook = await moderationData?.getWebhook(client)

    const webhookNameInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'moderationWebhookName', 'input'))
      .setLabel('Webhook name')
      .setPlaceholder('Enter new webhook name')
      .setValue(webhook?.name ?? '')
      .setStyle(TextInputStyle.Short)
      .setRequired(false)
    const webhookAvatarInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'moderationWebhookAvatar', 'input'))
      .setLabel('Webhook avatar')
      .setPlaceholder('Enter new webhook avatar URL or use variables')
      .setValue(moderationData?.data.logs.rawWebhookAvatar ?? '')
      .setStyle(TextInputStyle.Short)
      .setRequired(false)

    const actionRows = [
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(webhookNameInput),
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(webhookAvatarInput)
    ]

    const modal = new ModalBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'moderationLogsWebhook', 'modal'))
      .setTitle('Webhook editor')
      .addComponents(actionRows)

    await interaction.showModal(modal)
  }

  public static async editResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string) {
    const moderationData = client.moderationSettings.get(id)
    const webhookName = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'moderationWebhookName', 'input'))
    const webhookAvatar = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'moderationWebhookAvatar', 'input'))

    if (!moderationData) return

    const webhook = await moderationData.getWebhook(client)

    if (!webhook) return

    if (webhookAvatar) {
      moderationData.data.logs.rawWebhookAvatar = webhookAvatar
    }

    await webhook.edit({
      name: webhookName ?? webhook.name,
      avatar: SettingsUtils.formatImage(client, interaction, webhookAvatar) ?? webhook.avatarURL()
    })

    await this.initialMessage(client, interaction, id)
  }
}