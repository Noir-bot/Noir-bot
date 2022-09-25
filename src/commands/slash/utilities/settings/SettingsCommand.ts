import { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonInteraction, ChatInputCommandInteraction, MessageActionRowComponentBuilder } from 'discord.js'
import Colors from '../../../../constants/Colors'
import Options from '../../../../constants/Options'
import NoirClient from '../../../../structures/Client'
import ChatCommand from '../../../../structures/commands/ChatCommand'

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

  public async execute(client: NoirClient, interaction: ChatInputCommandInteraction) {
    const guildId = interaction.guild?.id

    if (!guildId) {
      await client.reply.reply({
        interaction: interaction,
        color: Colors.warning,
        author: 'Execution error',
        description: 'This command is server only.'
      })
    }

    else {
      await SettingsCommand.initialMessage(client, interaction, guildId)
    }
  }

  public static async initialMessage(client: NoirClient, interaction: ChatInputCommandInteraction | ButtonInteraction, id: string) {
    const buttons = [
      new ButtonBuilder()
        .setCustomId(client.componentsUtils.generateId('settings', id, 'welcome', 'button'))
        .setLabel('Welcome')
        .setStyle(client.componentsUtils.defaultStyle),
      new ButtonBuilder()
        .setCustomId(client.componentsUtils.generateId('settings', id, 'moderation', 'button'))
        .setLabel('Moderation')
        .setStyle(client.componentsUtils.defaultStyle)
    ]

    const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(buttons)

    await client.reply.reply({
      interaction: interaction,
      color: Colors.primary,
      author: 'Noir settings',
      authorImage: Options.clientAvatar,
      description: `Hello ${interaction.user.username}, use buttons bellow to navigate and configure Noir as you want. If you have any questions be sure to join our [support server](${Options.guildInvite})`,
      components: [actionRow],
      ephemeral: true,
    })
  }
}