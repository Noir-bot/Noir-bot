import Colors from '@constants/Colors'
import Emojis from '@constants/Emojis'
import Options from '@constants/Options'
import Reply from '@helpers/Reply'
import Client from '@structures/Client'
import ChatCommand from '@structures/commands/ChatCommand'
import { AccessType, CommandCategory, CommandType } from '@structures/commands/Command'
import { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, MessageActionRowComponentBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction } from 'discord.js'

export default class HelpCommand extends ChatCommand {
  constructor(client: Client) {
    super(
      client,
      {
        permissions: ['EmbedLinks'],
        access: AccessType.Public,
        type: CommandType.Public,
        category: CommandCategory.Information,
        status: true
      },
      {
        name: 'help',
        description: 'Help command',
        defaultMemberPermissions: 'SendMessages',
        type: ApplicationCommandType.ChatInput,
        dmPermission: false,
      }
    )
  }

  public static category = [
    {
      label: 'Information commands',
      value: 'i',
      description: 'Get information about users, servers and more.',
      emoji: Emojis.book
    },
    {
      label: 'Moderation commands',
      value: 'm',
      description: 'Moderate over your servers with this powerful commands.',
      emoji: Emojis.moderation
    },
    {
      label: 'Utility commands',
      value: 'u',
      description: 'Utility commands for different reasons and needs.',
      emoji: Emojis.news
    }
  ]

  public async execute(client: Client, interaction: ChatInputCommandInteraction | ButtonInteraction) {
    await HelpCommand.initialMessage(client, interaction)
  }

  public static async select(client: Client, interaction: StringSelectMenuInteraction) {
    const category = interaction.values[0]

    HelpCommand.categoryMessage(client, interaction, category)
  }

  public static async button(client: Client, interaction: ButtonInteraction) {
    const type = interaction.customId.split('-')[1]

    if (type == 'back') {
      await HelpCommand.initialMessage(client, interaction)
    }
  }

  public static async initialMessage(client: Client, interaction: ChatInputCommandInteraction | ButtonInteraction) {
    const buttons = [
      new ButtonBuilder()
        .setCustomId('help-setup')
        .setLabel('Setup Noir')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setURL(Options.docsLink)
        .setLabel('Noir docs')
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setURL(Options.clientInvite)
        .setLabel('Invite Noir')
        .setStyle(ButtonStyle.Link),
    ]

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('help-categories')
      .setPlaceholder('Choose category')
      .addOptions(HelpCommand.category)

    const actionRows = [
      new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(selectMenu),
      new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(buttons)
    ]

    await Reply.reply({
      client,
      interaction: interaction,
      color: Colors.primary,
      thumbnail: client.user?.avatarURL() ?? undefined,
      description: `# Need help ?\nhey there, do not know where to start check out our [official guide](${Options.docsLink}/quick-guide) and quickly setup Noir for your server. If you got any question contact moderators in [the support server](${Options.guildInvite})`,
      components: actionRows
    })
  }

  public static async categoryMessage(client: Client, interaction: StringSelectMenuInteraction, category: string) {
    let description = ''

    const button = new ButtonBuilder()
      .setCustomId('help-back')
      .setLabel('Go back')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji(Emojis.back)

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('help-categories')
      .setPlaceholder('Change category')
      .addOptions(HelpCommand.category)

    const actionRows = [
      new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(selectMenu),
      new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(button)
    ]

    if (category == 'i') {
      description = '# Information commands\nGet information about servers, users and other stuff\n\n' +
      `${client.commands
        .filter(command => command.options.category == CommandCategory.Information && command.options.type == CommandType.Public && command.data.type == ApplicationCommandType.ChatInput)
        .map(command => `- </${command.data.name}:${client.commandsId.get(command.data.name)}> ${(command as ChatCommand).data.description ?? 'No description'}`)
        .join('\n')
      }`
    }

    else if (category == 'm') {
      description = '# Moderation commands\nControl over the members with our powerful tools\n\n' +
      `${client.commands
        .filter(command => command.options.category == CommandCategory.Moderation && command.options.type == CommandType.Public && command.data.type == ApplicationCommandType.ChatInput)
        .map(command => `- </${command.data.name}:${client.commandsId.get(command.data.name)}> ${(command as ChatCommand).data.description ?? 'No description'}`)
        .join('\n')
      }`
    }

    else if (category == 'u') {
      description = '# Utility commands\nMiscellaneous utility commands for different use cases\n\n' +
      `${client.commands
        .filter(command => command.options.category == CommandCategory.Utility && command.options.type == CommandType.Public && command.data.type == ApplicationCommandType.ChatInput)
        .map(command => `- </${command.data.name}:${client.commandsId.get(command.data.name)}> ${(command as ChatCommand).data.description ?? 'No description'}`)
        .join('\n')
      }`
    }

    await Reply.reply({
      client,
      interaction: interaction,
      color: Colors.primary,
      thumbnail: client.user?.avatarURL() ?? undefined,
      description: description,
      components: actionRows
    })
  }
}
