import Colors from '@constants/Colors'
import Emojis from '@constants/Emojis'
import Reply from '@helpers/Reply'
import Client from '@structures/Client'
import Moderation from '@structures/moderation/Moderation'
import { ActionRowBuilder, AnySelectMenuInteraction, ButtonBuilder, ButtonInteraction, ButtonStyle, ChannelSelectMenuBuilder, ChannelSelectMenuInteraction, ChannelType, MessageActionRowComponentBuilder } from 'discord.js'

export default class HelpWizardModeration {
  public static async initialMessage(client: Client, interaction: ButtonInteraction<'cached'> | AnySelectMenuInteraction<'cached'>) {
    const moderationData = await Moderation.cache(client, interaction.guildId, false, true)
    const webhookChannel = (moderationData.webhook ? await Moderation.getWebhook(client, moderationData.webhook) : undefined)?.channelId

    const channelMenu = new ChannelSelectMenuBuilder()
      .setChannelTypes(ChannelType.GuildText)
      .setCustomId('help-moderation-channel')
      .setPlaceholder('Channel for moderation logs')
      .setMaxValues(1)
      .setMinValues(1)

    const buttons = [
      [
        new ButtonBuilder()
          .setCustomId('help-moderation-back')
          .setLabel('Previous step')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji(Emojis.leftArrow),
        new ButtonBuilder()
          .setCustomId('help-moderation-next')
          .setLabel('Finish setup')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji(Emojis.finish)
      ],
      [
        new ButtonBuilder()
          .setCustomId('help-moderation-logs')
          .setLabel(`${moderationData.logs ? 'Disable' : 'Enable'} moderation logs`)
          .setStyle(moderationData.logs ? ButtonStyle.Success : ButtonStyle.Secondary)
          .setEmoji(moderationData.logs ? Emojis.enable : Emojis.disable),
      ]
    ]

    const actionRows = [
      new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(buttons[0]),
      new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(channelMenu),
      new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(buttons[1])
    ]

    await Reply.reply({
      client,
      interaction: interaction,
      color: Colors.primary,
      description: `# Moderation setup\nModerate your servers with automation. Check out other moderating features via </settings:${client.commandsId.get('settings')}> command.\n\n- Logs status ${moderationData.logs ? Emojis.enable : Emojis.disable}${webhookChannel ? `\n- Logs channel <#${webhookChannel}>` : ''}`,
      image: 'https://i.imgur.com/6rmpgHF.png',
      components: actionRows
    })
  }

  public static async channelResponse(client: Client, interaction: ChannelSelectMenuInteraction<'cached'>) {
    const moderationData = await Moderation.cache(client, interaction.guildId, false, true)
    const channelId = interaction.values[0]

    moderationData.webhookChannel = channelId

    await this.initialMessage(client, interaction)
  }
}