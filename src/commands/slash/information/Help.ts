import { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, MessageActionRowComponentBuilder } from 'discord.js'
import { colors } from '../../../libs/config/design'
import { invite } from '../../../libs/config/settings'
import NoirClient from '../../../libs/structures/Client'
import NoirChatCommand from '../../../libs/structures/command/ChatCommand'

export default class HelpCommand extends NoirChatCommand {
  constructor(client: NoirClient,) {
    super(
      client,
      {
        permissions: ['SendMessages', 'EmbedLinks'],
        category: 'information',
        access: 'public',
        type: 'public',
        status: true
      },
      {
        name: 'help',
        description: 'Help command',
        nameLocalizations: { 'ru': 'помощ' },
        descriptionLocalizations: { 'ru': 'Команда помощи' },
        defaultMemberPermissions: 'SendMessages',
        type: ApplicationCommandType.ChatInput,
        dmPermission: false,
      }
    )
  }

  private backButton() {
    return new ButtonBuilder()
      .setLabel('Back')
      .setCustomId(this.generateButtonId('back'))
      .setStyle(ButtonStyle.Secondary)
  }

  private generateButtonId(type: string): string {
    return `help-${type}-button`
  }

  public async execute(client: NoirClient, interaction: ChatInputCommandInteraction | ButtonInteraction): Promise<void> {
    const avatar = client.user?.avatarURL() ? client.user.avatarURL() : undefined
    const buttons = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([
      new ButtonBuilder().setCustomId(this.generateButtonId('faq')).setLabel('FAQ').setStyle(ButtonStyle.Secondary)
    ])

    await client.noirReply.reply({
      interaction: interaction,
      color: colors.Primary,
      author: 'Help command',
      authorImage: avatar == null ? undefined : avatar,
      description: `Hey there, if you get any problem don't hesitate, contact our moderators. Still not part of our community server, be sure to join [here](${invite})`,
      footer: 'Created with <3 by Loid',
      components: [buttons],
      fetch: true
    })
  }

  public async buttonResponse(client: NoirClient, interaction: ButtonInteraction): Promise<void> {
    const parts = interaction.customId.toLowerCase().split('-')
    const type = parts[1]

    if (type == 'faq') await this.faqResponse(client, interaction)
    else await this.execute(client, interaction)
  }

  public async faqResponse(client: NoirClient, interaction: ButtonInteraction): Promise<void> {
    const avatar = client.user?.avatarURL() ? client.user.avatarURL() : undefined
    const buttons = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([
      this.backButton()
    ])

    await client.noirReply.reply({
      interaction: interaction,
      color: colors.Primary,
      author: 'Frequently asked questions',
      authorImage: avatar == null ? undefined : avatar,
      fields: [
        {
          name: 'How to contribute ?',
          value: 'Noir bot will always be open source, feel free to contribute whenever you want',
          inline: false
        },
        {
          name: 'How to become moderator ?',
          value: 'Currently, there is requirements for moderators, but we will let you know if we need',
          inline: false
        },
        {
          name: 'How can I setup Noir in my server ?',
          value: 'Very simple, use one command `settings` and get advanced interface with setup features. If you get any questions about interface, be sure to ask it in our support server',
          inline: false
        }
      ],
      components: [buttons],
      fetch: true
    })
  }
}