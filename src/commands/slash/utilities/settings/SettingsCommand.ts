import { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonInteraction, ChatInputCommandInteraction, MessageActionRowComponentBuilder } from 'discord.js'
import Colors from '../../../../constants/Colors'
import Options from '../../../../constants/Options'
import NoirClient from '../../../../structures/Client'
import ChatCommand from '../../../../structures/commands/ChatCommand'
import SettingsUtils from './SettingsUtils'

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
        description: 'Noir settings',
        defaultMemberPermissions: ['ManageGuild', 'ManageChannels', 'ManageRoles', 'ManageWebhooks'],
        type: ApplicationCommandType.ChatInput,
        dmPermission: false
      }
    )
  }

  public async execute(client: NoirClient, interaction: ChatInputCommandInteraction<'cached'>) {
    const guildId = interaction.guild.id

    await SettingsCommand.initialMessage(client, interaction, guildId)
  }

  public static async initialMessage(client: NoirClient, interaction: ChatInputCommandInteraction<'cached'> | ButtonInteraction<'cached'>, id: string) {
    const buttons = [
      new ButtonBuilder()
        .setCustomId(SettingsUtils.generateId('settings', id, 'welcome', 'button'))
        .setLabel('Welcome system configuration')
        .setStyle(SettingsUtils.defaultStyle),
      new ButtonBuilder()
        .setCustomId(SettingsUtils.generateId('settings', id, 'moderation', 'button'))
        .setLabel('Moderation settings')
        .setStyle(SettingsUtils.defaultStyle)
    ]

    const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(buttons)

    await client.reply.reply({
      interaction: interaction,
      color: Colors.primary,
      author: 'Noir settings',
      authorImage: Options.clientAvatar,
      description: `Hello ${interaction.user.username}, welcome to Noir's settings dashboard, navigate and configure Noir as you want.`,
      fields: [
        {
          name: 'Support',
          value: `In case you have issue, contact to our [support server](${Options.guildInvite}).`,
          inline: false
        },
        {
          name: 'Data and usage',
          value: 'All collected data is strictly used only across Noir\'s ecosystem. It is fully controlled by the user and can be permanently deleted.',
          inline: false
        }
      ],
      components: [actionRow],
      ephemeral: true,
    })
  }
}