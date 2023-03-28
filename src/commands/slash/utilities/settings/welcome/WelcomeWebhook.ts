import Colors from '@constants/Colors'
import Emojis from '@constants/Emojis'
import Reply from '@helpers/Reply'
import Client from '@structures/Client'
import Save from '@structures/Save'
import WelcomeMessage from '@structures/welcome/WelcomeMessage'
import { ActionRowBuilder, AnySelectMenuInteraction, ButtonBuilder, ButtonInteraction, ChannelSelectMenuBuilder, ChannelSelectMenuInteraction, ChannelType, MessageActionRowComponentBuilder, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, TextInputBuilder, TextInputStyle, channelMention } from 'discord.js'
import Welcome from '../../../../../structures/welcome/Welcome'
import SettingsUtils from '../SettingsUtils'
import Options from './../../../../../constants/Options'

export default class WelcomeWebhook {
  public static async initialMessage(client: Client, interaction: ButtonInteraction<'cached'> | ChannelSelectMenuInteraction<'cached'> | ModalMessageModalSubmitInteraction<'cached'>, id: string) {
    const welcomeData = await Welcome.cache(client, interaction.guildId, false, true)
    const welcomeWebhook = welcomeData?.webhook ? await Welcome.getWebhook(client, welcomeData.webhook) : null

    const buttons = [
      [
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeWebhookChannel', 'button'))
          .setLabel(`${welcomeData?.webhook ? 'Change' : 'Setup'} channel`)
          .setStyle(SettingsUtils.generateStyle(welcomeData?.webhook))
          .setDisabled(!welcomeData?.status)
          .setEmoji(Emojis.chain),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeWebhookEdit', 'button'))
          .setLabel('Edit webhook settings')
          .setStyle(SettingsUtils.defaultStyle)
          .setEmoji(Emojis.gear)
          .setDisabled(!welcomeData?.status || !welcomeWebhook)
      ],
      [
        SettingsUtils.generateBack('settings', id, 'welcomeBack'),
        SettingsUtils.generateSave('settings', id, 'welcomeSave.welcomeWebhook', client, interaction.guildId, 'welcome'),
        SettingsUtils.generateRestore('settings', id, 'welcomeRestore.welcomeWebhook')
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
      author: 'Webhook settings',
      authorImage: client.user?.avatarURL(),
      description: 'Customizable webhook for your welcome messages.',
      fields: [{ name: 'Useful links', value: links, inline: false }],
      components: actionRows,
      ephemeral: true,
    })
  }

  public static async channelRequest(client: Client, interaction: ButtonInteraction<'cached'> | ChannelSelectMenuInteraction<'cached'>, id: string) {
    const welcomeData = await Welcome.cache(client, interaction.guildId, false, true)

    const buttons = [
      SettingsUtils.generateBack('settings', id, 'welcomeBack.welcomeWebhook'),
      SettingsUtils.generateSave('settings', id, 'welcomeSave.welcomeWebhookChannel', client, interaction.guildId, 'welcome'),
      SettingsUtils.generateRestore('settings', id, 'welcomeRestore.welcomeWebhookChannel')
    ]

    const channelSelectMenu = new ChannelSelectMenuBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, `welcomeWebhookChannel`, 'select'))
      .setPlaceholder('Select channel for messages')
      .setChannelTypes(ChannelType.GuildText)
      .setMaxValues(1)
      .setMinValues(1)


    const selectActionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(channelSelectMenu)
    const buttonActionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(buttons)

    await Reply.reply({
      client,
      interaction: interaction,
      author: 'Webhook channel',
      description: `${welcomeData.webhookChannel ? `Current channel ${channelMention(welcomeData.webhookChannel)}` : 'No channel'}`,
      color: Colors.primary,
      components: [selectActionRow, buttonActionRow]
    })
  }

  public static async editRequest(client: Client, interaction: ButtonInteraction<'cached'>, id: string) {
    const welcomeData = await Welcome.cache(client, interaction.guildId, false, true)

    const webhookNameInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeWebhookName', 'input'))
      .setLabel('Webhook name')
      .setPlaceholder('Enter new name')
      .setValue(welcomeData.webhookName ?? '')
      .setStyle(TextInputStyle.Short)
      .setRequired(false)
    const webhookAvatarInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeWebhookAvatar', 'input'))
      .setLabel('Webhook avatar')
      .setPlaceholder('Enter a valid image URL or a variable')
      .setValue(welcomeData?.webhookAvatar ?? '')
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
      .setTitle('Webhook editor')
      .addComponents(actionRows)

    await interaction.showModal(modal)
  }

  public static async channelResponse(client: Client, interaction: ChannelSelectMenuInteraction<'cached'>, id: string) {
    const welcomeData = await Welcome.cache(client, interaction.guildId, false, true)
    const saves = Save.cache(client, `${interaction.guildId}-welcome`)
    const channelId = interaction.values[0]

    welcomeData.webhookChannel = channelId
    saves.count += 1

    await this.channelRequest(client, interaction, id)
  }

  public static async editResponse(client: Client, interaction: ModalMessageModalSubmitInteraction<'cached'>, id: string) {
    const welcomeData = await Welcome.cache(client, interaction.guildId, false, true)
    const saves = Save.cache(client, `${interaction.guildId}-welcome`)
    const webhookName = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'welcomeWebhookName', 'input'))
    const webhookAvatar = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'welcomeWebhookAvatar', 'input'))

    welcomeData.webhookName = WelcomeMessage.formatVariable(webhookName, { guild: { icon: interaction.guild.iconURL() }, client: { avatar: client.user?.avatarURL() } })
    welcomeData.webhookAvatar = WelcomeMessage.formatImage(webhookAvatar, { guild: interaction.guild.iconURL(), client: client.user?.avatarURL() })
    saves.count += 1

    await this.initialMessage(client, interaction, id)
  }

  public static async buttonResponse(client: Client, interaction: ButtonInteraction<'cached'>, id: string, method: string) {
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

  public static async selectResponse(client: Client, interaction: AnySelectMenuInteraction<'cached'>, id: string, method: string) {
    if (method == 'welcomeWebhookChannel' && interaction.isChannelSelectMenu()) {
      await WelcomeWebhook.channelResponse(client, interaction, id)
    }
  }

  public static async modalResponse(client: Client, interaction: ModalMessageModalSubmitInteraction<'cached'>, id: string, method: string) {
    if (method == 'welcomeWebhookEdit') {
      await WelcomeWebhook.editResponse(client, interaction, id)
    }
  }
}