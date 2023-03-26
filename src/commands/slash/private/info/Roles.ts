import Emojis from '@constants/Emojis'
import Client from '@structures/Client'
import ChatCommand from '@structures/commands/ChatCommand'
import { AccessType, CommandType } from '@structures/commands/Command'
import { ApplicationCommandType } from 'discord-api-types/v10'
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, MessageActionRowComponentBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction } from 'discord.js'
import Reply from '../../../../helpers/Reply'

export default class RolesCommand extends ChatCommand {
  constructor(client: Client) {
    super(
      client,
      {
        permissions: [],
        access: AccessType.Private,
        type: CommandType.Private,
        status: true
      },
      {
        name: 'roles',
        description: 'Ping roles',
        type: ApplicationCommandType.ChatInput,
        defaultMemberPermissions: ['Administrator'],
        dmPermission: false,
      }
    )
  }

  public static roles = ['1089225704819916843', '1089619187707695147', '1089619210486939698']

  public async execute(client: Client, interaction: ChatInputCommandInteraction<'cached'>) {
    const roles = [
      {
        name: 'Status ping',
        value: RolesCommand.roles[0],
        description: 'Get notified about status updates.',
        emoji: Emojis.status
      },
      {
        name: 'Update ping',
        value: RolesCommand.roles[1],
        description: 'Get notified about new updates.',
        emoji: Emojis.chain
      },
      {
        name: 'News ping',
        value: RolesCommand.roles[2],
        description: 'Get notified about latest news.',
        emoji: Emojis.news
      }
    ]

    const buttons = [
      new ButtonBuilder()
        .setCustomId('rolesAdd')
        .setLabel('Get all')
        .setEmoji(Emojis.addField)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('rolesRemove')
        .setLabel('Remove all')
        .setEmoji(Emojis.trash)
        .setStyle(ButtonStyle.Secondary),
    ]

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('roles')
      .setPlaceholder('Select ping roles')
      .setMaxValues(3)

    roles.forEach(role => {
      selectMenu.addOptions({
        label: role.name,
        value: role.value,
        description: role.description,
        emoji: role.emoji
      })
    })

    const actionRow = [
      new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(selectMenu),
      new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(buttons)
    ]

    Reply.sendMessage({
      client,
      channel: interaction.channelId,
      author: 'Ping roles',
      authorImage: client.user?.avatarURL() ?? '',
      description: 'Get ping roles and get notified about updates and news.',
      components: actionRow
    })

    Reply.reply({
      client,
      interaction,
      update: false,
      content: 'sent'
    })
  }

  public static async select(client: Client, interaction: StringSelectMenuInteraction<'cached'>) {
    const roles = interaction.values

    if (!roles) return

    try {
      await interaction.member.roles.remove(RolesCommand.roles)
      await interaction.member.roles.add(roles)
    } catch { }

    Reply.reply({
      client,
      interaction,
      author: 'Ping roles',
      authorImage: client.user?.avatarURL() ?? '',
      description: 'You have successfully got ping roles.',
      update: false,
      ephemeral: true
    })
  }

  public static async button(client: Client, interaction: ButtonInteraction<'cached'>, type: string) {
    if (type == 'rolesadd') {
      try {
        await interaction.member.roles.add(RolesCommand.roles)
      } catch { }

      Reply.reply({
        client,
        interaction,
        author: 'Ping roles',
        authorImage: client.user?.avatarURL() ?? '',
        description: 'You have successfully got all ping roles.',
        update: false,
        ephemeral: true
      })
    }

    if (type == 'rolesremove') {
      try {
        await interaction.member.roles.remove(RolesCommand.roles)
      } catch { }

      Reply.reply({
        client,
        interaction,
        author: 'Ping roles',
        authorImage: client.user?.avatarURL() ?? '',
        description: 'You have successfully removed all ping roles.',
        update: false,
        ephemeral: true
      })
    }
  }
}