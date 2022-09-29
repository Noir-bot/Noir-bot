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
        description: 'Noir bot settings',
        defaultMemberPermissions: ['ManageGuild', 'ManageChannels', 'ManageRoles'],
        type: ApplicationCommandType.ChatInput,
        dmPermission: false
      }
    )
  }

  public async execute(client: NoirClient, interaction: ChatInputCommandInteraction<'cached'>) {
    const guildId = interaction.guild.id

    await SettingsCommand.initialMessage(client, interaction, guildId)
  }

  public static async initialMessage(client: NoirClient, interaction: ChatInputCommandInteraction | ButtonInteraction, id: string) {
    const buttons = [
      new ButtonBuilder()
        .setCustomId(SettingsUtils.generateId('settings', id, 'welcome', 'button'))
        .setLabel('Welcome setup')
        .setStyle(SettingsUtils.defaultStyle),
      new ButtonBuilder()
        .setCustomId(SettingsUtils.generateId('settings', id, 'moderation', 'button'))
        .setLabel('Moderation setup')
        .setStyle(SettingsUtils.defaultStyle)
    ]

    const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(buttons)

    await client.reply.reply({
      interaction: interaction,
      color: Colors.primary,
      author: 'Noir settings',
      authorImage: Options.clientAvatar,
      description: `Hello ${interaction.user.username}. Use components to navigate and configure Noir's settings.`,
      fields: [
        {
          name: 'Support',
          value: `In case of having issue, contact to our [support server](${Options.guildInvite}).`,
          inline: false
        },
        {
          name: 'Data and usage',
          value: 'Changed data is not saving automatically in order to make it possible to return to the last save point. Use \`save data\` button to save last changes. Unsaved data will be lost after Noir\'s cache clear. This data is not being used for any other purpose except the server it was created in.',
          inline: false
        }
      ],
      components: [actionRow],
      ephemeral: true,
    })
  }
}