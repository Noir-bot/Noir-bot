import Colors from '@constants/Colors'
import Options from '@constants/Options'
import Reply from '@helpers/Reply'
import Client from '@structures/Client'
import ChatCommand from '@structures/commands/ChatCommand'
import { AccessType, CommandType } from '@structures/commands/Command'
import { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, MessageActionRowComponentBuilder } from 'discord.js'

export default class HelpCommand extends ChatCommand {
  constructor(client: Client) {
    super(
      client,
      {
        permissions: ['SendMessages', 'EmbedLinks'],
        access: AccessType.Public,
        type: CommandType.Public,
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

  public async execute(client: Client, interaction: ChatInputCommandInteraction | ButtonInteraction) {
    await HelpCommand.initialMessage(client, interaction)
  }

  public static async initialMessage(client: Client, interaction: ChatInputCommandInteraction | ButtonInteraction) {
    const button = new ButtonBuilder()
      .setURL(Options.docsLink)
      .setLabel('Noir docs')
      .setStyle(ButtonStyle.Link)

    const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(button)

    await Reply.reply({
      client,
      interaction: interaction,
      color: Colors.primary,
      author: 'Help command',
      authorImage: client.user?.avatarURL(),
      description: `Hey there, in case of any questions or problems contact in our [support server](${Options.guildInvite})`,
      components: [actionRow]
    })
  }
}
