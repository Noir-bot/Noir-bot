import { ButtonBuilder, ButtonStyle } from 'discord.js'
import SettingsUtils from './SettingsCommandUtils'

export default class SettingsCommandComponents {
  public static defaultButtonStyle = ButtonStyle.Secondary

  public static backButton(id: string, type: string, after?: string): ButtonBuilder {
    return new ButtonBuilder()
      .setCustomId(SettingsUtils.generateComponentId(id, `${type}Back${after || ''}`, 'button'))
      .setLabel('Back')
      .setStyle(ButtonStyle.Secondary)
  }

  public static saveButton(id: string, type: string, after?: string): ButtonBuilder {
    return new ButtonBuilder()
      .setCustomId(SettingsUtils.generateComponentId(id, `${type}Save${after || ''}`, 'button'))
      .setLabel('Save')
      .setStyle(ButtonStyle.Primary)
  }

  public static resetButton(id: string, type: string, after?: string): ButtonBuilder {
    return new ButtonBuilder()
      .setCustomId(SettingsUtils.generateComponentId(id, `${type}Reset${after || ''}`, 'button'))
      .setLabel('Reset')
      .setStyle(ButtonStyle.Danger)
  }

  public static exampleButton(id: string, type: string, after?: string) {
    return new ButtonBuilder()
      .setCustomId(SettingsUtils.generateComponentId(id, `${type}Example${after || ''}`, 'button'))
      .setLabel('Show example')
      .setStyle(ButtonStyle.Primary)
  }
}