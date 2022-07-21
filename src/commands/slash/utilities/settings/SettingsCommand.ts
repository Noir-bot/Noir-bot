import { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonInteraction, ChatInputCommandInteraction, MessageActionRowComponentBuilder } from 'discord.js'
import Colors from '../../../../constants/Colors'
import Options from '../../../../constants/Options'
import NoirClient from '../../../../structures/Client'
import ChatCommand from '../../../../structures/command/ChatCommand'
import SettingsComponents from './SettingsCommandComponents'

import SettingsUtils from './SettingsCommandUtils'

export default class SettingsCommand extends ChatCommand {
  constructor(client: NoirClient) {
    super(
      client,
      {
        permissions: ['SendMessages', 'EmbedLinks', 'ManageWebhooks'],
        access: 'public',
        type: 'public',
        status: true
      },
      {
        name: 'settings',
        description: 'Setup Noir',
        nameLocalizations: { ru: 'настройки' },
        descriptionLocalizations: { ru: 'Настроить Noir' },
        defaultMemberPermissions: ['ManageGuild', 'ManageChannels', 'ManageRoles'],
        type: ApplicationCommandType.ChatInput,
        dmPermission: false
      }
    )
  }

  public async execute(client: NoirClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const id = interaction.guild?.id

    if (!id) {
      await client.reply.reply({
        interaction: interaction,
        color: Colors.warning,
        author: 'Guild error',
        description: 'Undefined guild Id'
      })

      return
    }

    await SettingsCommand.initialMessage(client, interaction, id)
  }

  public static async initialMessage(client: NoirClient, interaction: ChatInputCommandInteraction | ButtonInteraction, id: string) {
    const buttons = [
      new ButtonBuilder()
        .setCustomId(SettingsUtils.generateComponentId(id, 'welcome', 'button'))
        .setLabel('Welcome settings')
        .setStyle(SettingsComponents.defaultButtonStyle),
      new ButtonBuilder()
        .setCustomId(SettingsUtils.generateComponentId(id, 'logging', 'button'))
        .setLabel('Logging settings')
        .setStyle(SettingsComponents.defaultButtonStyle),
      new ButtonBuilder()
        .setCustomId(SettingsUtils.generateComponentId(id, 'automod', 'button'))
        .setLabel('Automod settings')
        .setStyle(SettingsComponents.defaultButtonStyle)
    ]

    const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(buttons)

    await client.reply.reply({
      interaction: interaction,
      color: Colors.primary,
      author: 'Noir settings',
      authorImage: Options.clientAvatar,
      description: `Setup Noir in the best way. Use buttons bellow to navigate, for more information or if you have question be sure to join our [support server](${Options.guildInvite})`,
      components: [actionRow],
      ephemeral: true,
    })
  }
}