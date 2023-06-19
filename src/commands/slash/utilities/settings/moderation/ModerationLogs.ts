import SettingsUtils from '@commands/slash/utilities/settings/SettingsUtils'
import Colors from '@constants/Colors'
import Emojis from '@constants/Emojis'
import Options from '@constants/Options'
import Reply from '@helpers/Reply'
import Client from '@structures/Client'
import Save from '@structures/Save'
import Moderation from '@structures/moderation/Moderation'
import WelcomeMessage from '@structures/welcome/WelcomeMessage'
import { ActionRowBuilder, AnySelectMenuInteraction, ButtonBuilder, ButtonInteraction, ChannelSelectMenuBuilder, ChannelSelectMenuInteraction, ChannelType, MessageActionRowComponentBuilder, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, TextInputBuilder, TextInputStyle, channelMention } from 'discord.js'

export default class ModerationLogs {
  public static async initialMessage(client: Client, interaction: ButtonInteraction<'cached'> | ModalMessageModalSubmitInteraction<'cached'>, id: string) {
    const moderationData = await Moderation.cache(client, interaction.guildId, false, true)
    const moderationWebhook = moderationData?.webhook ? await Moderation.getWebhook(client, moderationData?.webhook) : null

    const buttons = [
      [
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, 'moderationLogsStatus', 'button'))
          .setLabel(`${moderationData.logs ? 'Disable' : 'Enable'} logs`)
          .setStyle(SettingsUtils.generateStyle(moderationData?.logs))
          .setEmoji(`${moderationData?.logs ? Emojis.enable : Emojis.disable}`)
          .setDisabled(!moderationData.status),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, 'moderationWebhookChannel', 'button'))
          .setLabel(`${moderationData?.webhook ? 'Change' : 'Setup'} channel`)
          .setStyle(SettingsUtils.generateStyle(moderationData?.webhook))
          .setDisabled(!moderationData.status || !moderationData.logs),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, 'moderationWebhookEdit', 'button'))
          .setLabel('Edit webhook settings')
          .setStyle(SettingsUtils.defaultStyle)
          .setDisabled(!moderationData.status || !moderationData.logs && !moderationWebhook)
      ],
      [
        SettingsUtils.generateBack('settings', id, 'moderationBack'),
        SettingsUtils.generateSave('settings', id, 'moderationSave.moderationLogs', client, interaction.guildId, 'moderation'),
        SettingsUtils.generateRestore('settings', id, 'moderationRestore.moderationLogs')
      ]
    ]

    const actionRows = [
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[0]),
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[1])
    ]

    const links = [
      `[Image variables](${Options.docsLink}/welcome/image-variables)`
    ].map(link => `${Emojis.point} ${link}`).join('\n')

    await Reply.reply({
      client,
      interaction: interaction,
      color: Colors.primary,
      author: 'Logs settings',
      authorImage: client.user?.avatarURL(),
      description: 'Setup channel and create webhook. Customize webhook as you want.',
      components: actionRows,
      ephemeral: true,
    })
  }

  public static async channelRequest(client: Client, interaction: ButtonInteraction<'cached'> | ChannelSelectMenuInteraction<'cached'>, id: string) {
    const moderationData = await Moderation.cache(client, interaction.guildId, false, true)

    const buttons = [
      SettingsUtils.generateBack('settings', id, 'moderationBack.moderationWebhookChannel'),
      SettingsUtils.generateSave('settings', id, 'moderationSave.moderationWebhookChannel', client, interaction.guildId, 'moderation'),
      SettingsUtils.generateRestore('settings', id, 'moderationRestore.moderationWebhookChannel')
    ]

    const channelSelectMenu = new ChannelSelectMenuBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'moderationWebhookChannel', 'select'))
      .setPlaceholder('Select channel for messages')
      .setChannelTypes(ChannelType.GuildText)
      .setMaxValues(1)
      .setMinValues(1)

    const selectActionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(channelSelectMenu)
    const buttonActionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(buttons)

    const webhookChannel = (moderationData.webhook ? await Moderation.getWebhook(client, moderationData.webhook) : undefined)?.channelId

    await Reply.reply({
      client,
      interaction: interaction,
      author: 'moderation webhook channel',
      description: `${webhookChannel ? `Current channel ${channelMention(webhookChannel)}` : 'No channel'}`,
      color: Colors.primary,
      components: [selectActionRow, buttonActionRow]
    })
  }

  public static async editRequest(client: Client, interaction: ButtonInteraction<'cached'>, id: string) {
    const moderationData = await Moderation.cache(client, interaction.guildId, false, true)

    const webhookNameInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'moderationWebhookName', 'input'))
      .setLabel('Webhook name')
      .setPlaceholder('Enter new webhook name')
      .setValue(moderationData.webhookName ?? '')
      .setStyle(TextInputStyle.Short)
      .setRequired(false)
    const webhookAvatarInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'moderationWebhookAvatar', 'input'))
      .setLabel('Webhook avatar')
      .setPlaceholder('Enter a valid image URL or use variables')
      .setValue(moderationData?.webhookAvatar ?? '')
      .setStyle(TextInputStyle.Short)
      .setRequired(false)

    const actionRows = [
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(webhookNameInput),
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(webhookAvatarInput)
    ]

    const modal = new ModalBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'moderationWebhookEdit', 'modal'))
      .setTitle('Moderation webhook editor')
      .addComponents(actionRows)

    await interaction.showModal(modal)
  }

  public static async channelResponse(client: Client, interaction: ChannelSelectMenuInteraction<'cached'>, id: string) {
    const moderationData = await Moderation.cache(client, interaction.guildId, false, true)
    const save = Save.cache(client, `${interaction.guildId}-moderation`)
    const channelId = interaction.values[0]

    moderationData.webhookChannel = channelId
    save.count += 1

    await this.channelRequest(client, interaction, id)
  }

  public static async editResponse(client: Client, interaction: ModalMessageModalSubmitInteraction<'cached'>, id: string) {
    const moderationData = await Moderation.cache(client, interaction.guildId, false, true)
    const webhookName = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'moderationWebhookName', 'input'))
    const webhookAvatar = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'moderationWebhookAvatar', 'input'))
    const save = Save.cache(client, `${interaction.guildId}-moderation`)

    moderationData.webhookName = WelcomeMessage.formatVariable(webhookName, { guild: { icon: interaction.guild.iconURL() }, client: { avatar: client.user?.avatarURL() } })
    moderationData.webhookAvatar = WelcomeMessage.formatImage(webhookAvatar, { guild: interaction.guild.iconURL(), client: client.user?.avatarURL() })
    save.count += 1

    await this.initialMessage(client, interaction, id)
  }

  public static async buttonResponse(client: Client, interaction: ButtonInteraction<'cached'>, id: string, method: string) {
    if (method == 'moderationWebhook') {
      await ModerationLogs.initialMessage(client, interaction, id)
    }

    else if (method == 'moderationWebhookChannel') {
      await ModerationLogs.channelRequest(client, interaction, id)
    }

    else if (method == 'moderationWebhookEdit') {
      await ModerationLogs.editRequest(client, interaction, id)
    }
  }

  public static async selectResponse(client: Client, interaction: AnySelectMenuInteraction<'cached'>, id: string, method: string) {
    if (method == 'moderationWebhookChannel' && interaction.isChannelSelectMenu()) {
      await ModerationLogs.channelResponse(client, interaction, id)
    }
  }

  public static async modalResponse(client: Client, interaction: ModalMessageModalSubmitInteraction<'cached'>, id: string, method: string) {
    if (method == 'moderationWebhookEdit') {
      await ModerationLogs.editResponse(client, interaction, id)
    }
  }
}