import Colors from '@constants/Colors'
import Emojis from '@constants/Emojis'
import Reply from '@helpers/Reply'
import Client from '@structures/Client'
import Moderation from '@structures/moderation/Moderation'
import Welcome from '@structures/welcome/Welcome'
import { ActionRowBuilder, AnySelectMenuInteraction, ButtonBuilder, ButtonInteraction, ButtonStyle, MessageActionRowComponentBuilder } from 'discord.js'
import HelpCommand from '../Help'

export default class HelpWizardFinish {
  public static async initialMessage(client: Client, interaction: ButtonInteraction<'cached'> | AnySelectMenuInteraction<'cached'>) {
    const buttons = [
      new ButtonBuilder()
        .setCustomId('help-finish-back')
        .setLabel('Previous (moderation)')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(Emojis.moderation),
      new ButtonBuilder()
        .setCustomId('help-finish-save')
        .setLabel('Save changes')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(Emojis.finish),
    ]

    const actionRows = [
      new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(buttons),
    ]

    await Reply.reply({
      client,
      interaction: interaction,
      color: Colors.primary,
      description: '# Setup finish\nPlease, confirm your changes. Setup wizard will rewrite current settings.',
      image: 'https://i.imgur.com/LjPRqno.png',
      components: actionRows
    })
  }

  public static async saveResponse(client: Client, interaction: ButtonInteraction<'cached'>) {
    await Moderation.save(client, interaction.guildId)
    await Welcome.save(client, interaction.guildId)

    await HelpCommand.initialMessage(client, interaction)
  }
}