import { ActionRowBuilder, AnySelectMenuInteraction, ButtonBuilder, ButtonInteraction, ChannelSelectMenuBuilder, ChannelSelectMenuInteraction, ChannelType, MessageActionRowComponentBuilder, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, TextInputBuilder, TextInputStyle, channelMention } from 'discord.js'
import Colors from '../../../../../constants/Colors'
import Options from '../../../../../constants/Options'
import NoirClient from '../../../../../structures/Client'
import Moderation from '../../../../../structures/Moderation'
import Save from '../../../../../structures/Save'
import WelcomeMessage from '../../../../../structures/WelcomeMessage'
import SettingsUtils from '../SettingsUtils'

export default class ModerationLogs {
  public static async initialMessage(client: NoirClient, interaction: ButtonInteraction<'cached'> | ModalMessageModalSubmitInteraction<'cached'>, id: string) {
    const moderationData = await Moderation.cache(client, interaction.guildId)
    const moderationWebhook = moderationData?.webhook ? await Moderation.getWebhook(client, moderationData?.webhook) : null

    const buttons = [
      [
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, 'moderationLogsStatus', 'button'))
          .setLabel(`${moderationData.modLogs ? 'Disable' : 'Enable'} moderation logs`)
          .setStyle(SettingsUtils.generateStyle(moderationData?.modLogs))
          .setEmoji(`${moderationData?.modLogs ? '✅' : '❌'}`)
          .setDisabled(!moderationData.status),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, 'moderationWebhookChannel', 'button'))
          .setLabel(`${moderationData?.webhook ? 'Change' : 'Setup'} moderation channel`)
          .setStyle(SettingsUtils.generateStyle(moderationData?.webhook))
          .setDisabled(!moderationData.status || !moderationData.modLogs),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, 'moderationWebhookEdit', 'button'))
          .setLabel('Edit webhook settings')
          .setStyle(SettingsUtils.defaultStyle)
          .setDisabled(!moderationData.status || !moderationData.modLogs && !moderationWebhook)
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

  public static async channelRequest(client: NoirClient, interaction: ButtonInteraction<'cached'> | ChannelSelectMenuInteraction<'cached'>, id: string) {
    const moderationData = await Moderation.cache(client, interaction.guildId)

    const buttons = [
      SettingsUtils.generateBack('settings', id, 'moderationBack.moderationWebhook'),
      SettingsUtils.generateSave('settings', id, 'moderationSave.moderationWebhookChannel', client, interaction.guildId, 'moderation'),
      SettingsUtils.generateRestore('settings', id, 'moderationRestore.moderationWebhookChannel')
    ]

    const channelSelectMenu = new ChannelSelectMenuBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, `moderationWebhookChannel`, 'select'))
      .setPlaceholder('Select channel for messages')
      .setChannelTypes(ChannelType.GuildText)
      .setMaxValues(1)
      .setMinValues(1)


    const selectActionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(channelSelectMenu)
    const buttonActionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(buttons)

    await client.reply.reply({
      interaction: interaction,
      author: 'moderation webhook channel',
      description: `${moderationData.webhookChannel ? `Current channel ${channelMention(moderationData.webhookChannel)}` : 'No channel'}`,
      color: Colors.primary,
      components: [selectActionRow, buttonActionRow]
    })
  }

  public static async editRequest(client: NoirClient, interaction: ButtonInteraction<'cached'>, id: string) {
    const moderationData = await Moderation.cache(client, interaction.guildId)

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

  public static async channelResponse(client: NoirClient, interaction: ChannelSelectMenuInteraction<'cached'>, id: string) {
    const moderationData = await Moderation.cache(client, interaction.guildId)
    const save = Save.cache(client, `${interaction.guildId}-moderation`)
    const channelId = interaction.values[0]

    moderationData.webhookChannel = channelId
    save.count += 1

    await this.channelRequest(client, interaction, id)
  }

  public static async editResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction<'cached'>, id: string) {
    const moderationData = await Moderation.cache(client, interaction.guildId)
    const webhookName = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'moderationWebhookName', 'input'))
    const webhookAvatar = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'moderationWebhookAvatar', 'input'))
    const save = Save.cache(client, `${interaction.guildId}-moderation`)

    moderationData.webhookName = WelcomeMessage.formatVariable(webhookName, { guild: { icon: interaction.guild.iconURL() }, client: { avatar: Options.clientAvatar } })
    moderationData.webhookAvatar = WelcomeMessage.formatVariable(webhookAvatar, { guild: { icon: interaction.guild.iconURL() }, client: { avatar: Options.clientAvatar } })
    save.count += 1

    await this.initialMessage(client, interaction, id)
  }

  public static async buttonResponse(client: NoirClient, interaction: ButtonInteraction<'cached'>, id: string, method: string) {
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

  public static async selectResponse(client: NoirClient, interaction: AnySelectMenuInteraction<'cached'>, id: string, method: string) {
    if (method == 'moderationWebhookChannel' && interaction.isChannelSelectMenu()) {
      await ModerationLogs.channelResponse(client, interaction, id)
    }
  }

  public static async modalResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction<'cached'>, id: string, method: string) {
    if (method == 'moderationWebhookEdit') {
      await ModerationLogs.editResponse(client, interaction, id)
    }
  }
}