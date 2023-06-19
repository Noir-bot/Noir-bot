import Colors from '@constants/Colors'
import Emojis from '@constants/Emojis'
import Reply from '@helpers/Reply'
import Client from '@structures/Client'
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, MessageActionRowComponentBuilder } from 'discord.js'

export default class HelpWizardStart {
  public static async initialMessage(client: Client, interaction: ButtonInteraction) {
    const buttons = [
      new ButtonBuilder()
        .setCustomId('help-setup-cancel')
        .setLabel('Go back')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(Emojis.leftArrow),
      new ButtonBuilder()
        .setCustomId('help-setup-start')
        .setLabel('Start (welcome)')
        .setStyle(ButtonStyle.Success)
        .setEmoji(Emojis.welcome)
    ]

    const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(buttons)

    await Reply.reply({
      client,
      interaction: interaction,
      color: Colors.primary,
      description: '# Let\'s start\nMeet our powerful setup wizard to quickly setup Noir for your server.',
      image: 'https://i.imgur.com/KrAZeK4.png',
      components: [actionRow]
    })
  }
}