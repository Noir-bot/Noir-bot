import SettingsUtils from '@commands/slash/utilities/settings/SettingsUtils'
import Colors from '@constants/Colors'
import Emojis from '@constants/Emojis'
import Options from '@constants/Options'
import Reply from '@helpers/Reply'
import Client from '@structures/Client'
import ChatCommand from '@structures/commands/ChatCommand'
import { AccessType, CommandType } from '@structures/commands/Command'
import { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonInteraction, ChatInputCommandInteraction, MessageActionRowComponentBuilder } from 'discord.js'

export default class SettingsCommand extends ChatCommand {
  constructor(client: Client) {
    super(
      client,
      {
        permissions: ['SendMessages', 'EmbedLinks', 'ManageWebhooks'],
        access: AccessType.Public,
        type: CommandType.Public,
        status: true
      },
      {
        name: 'settings',
        description: 'Noir settings',
        defaultMemberPermissions: ['ManageGuild', 'ManageWebhooks'],
        type: ApplicationCommandType.ChatInput,
        dmPermission: false
      }
    )
  }

  public async execute(client: Client, interaction: ChatInputCommandInteraction<'cached'>) {
    await SettingsCommand.initialMessage(client, interaction, interaction.guildId)
  }

  public static async initialMessage(client: Client, interaction: ChatInputCommandInteraction<'cached'> | ButtonInteraction<'cached'>, id: string) {
    const buttons = [
      new ButtonBuilder()
        .setCustomId(SettingsUtils.generateId('settings', id, 'welcome', 'button'))
        .setLabel('Welcome settings')
        .setEmoji(Emojis.welcome)
        .setStyle(SettingsUtils.defaultStyle),
      new ButtonBuilder()
        .setCustomId(SettingsUtils.generateId('settings', id, 'moderation', 'button'))
        .setLabel('Moderation settings')
        .setEmoji(Emojis.moderation)
        .setStyle(SettingsUtils.defaultStyle)
    ]

    const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(buttons)

    await Reply.reply({
      client: client,
      interaction: interaction,
      color: Colors.primary,
      author: 'Noir settings',
      authorImage: client.user?.avatarURL(),
      description: `Hello ${interaction.user.username}, welcome to Noir's settings. Checkout our [quick guide](${Options.docsLink}/quick-guide) about Noir\'s setup.`,
      fields: [
        {
          name: 'Noir support',
          value: `Got into trouble or have question. Join [support server](${Options.guildInvite}) and contact our moderators for any kind of help.`,
          inline: false
        },
        {
          name: 'Data and usage',
          value: 'All stored data is well protected and only used across Noir\'s ecosystem. It is fully controlled by user and user can always request for permanent data deletion.',
          inline: false
        }
      ],
      components: [actionRow],
      ephemeral: true,
    })
  }
}
