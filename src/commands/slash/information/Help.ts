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
        type: 'private',
        status: true
      },
      {
        name: 'help',
        description: 'Help command',
        type: ApplicationCommandType.ChatInput
      }
    )
  }

  public async execute(client: NoirClient, interaction: ChatInputCommandInteraction | ButtonInteraction): Promise<void> {
    const avatar = client.user?.avatarURL() ? client.user.avatarURL() : undefined
    const buttons = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([
      new ButtonBuilder().setCustomId('help-faq').setLabel('FAQ').setStyle(ButtonStyle.Secondary)
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

  public async faq(client: NoirClient, interaction: ButtonInteraction): Promise<void> {
    const avatar = client.user?.avatarURL() ? client.user.avatarURL() : undefined
    const buttons = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([
      new ButtonBuilder().setCustomId('help').setLabel('Back').setStyle(ButtonStyle.Secondary)
    ])

    await client.noirReply.reply({
      interaction: interaction,
      color: colors.Primary,
      author: 'Frequently asked questions',
      authorImage: avatar == null ? undefined : avatar,
      // description: 'Frequently asked questions',
      fields: [
        {
          name: 'How to contribute ?',
          value: 'Noir is and will be open source always, you can contribute anytime you want',
          inline: false
        },
        {
          name: 'How to become moderator ?',
          value: 'It is unavailable to become moderator now, but we will let you know when it will be available',
          inline: false
        },
        {
          name: 'How can I setup Noir in my server ?',
          value: 'Very simple, just use one command `setup`, and you will get very easy and understandable menu with setup buttons. If you get any questions about setup menu, be sure to ask it in our support server',
          inline: false
        }
      ],
      components: [buttons],
      fetch: true
    })
  }
}