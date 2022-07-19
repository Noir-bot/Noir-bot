import { ButtonBuilder, ButtonStyle } from 'discord.js'
import EmbedCommandUtils from './EmbedCommandUtils'

export default class EmbedCommandComponents {
  public static defaultButtonStyle = ButtonStyle.Secondary

  public static backButton(id: string): ButtonBuilder {
    return new ButtonBuilder()
      .setCustomId(EmbedCommandUtils.generateComponentId(id, 'back', 'button'))
      .setLabel('Back')
      .setStyle(ButtonStyle.Secondary)
  }
}