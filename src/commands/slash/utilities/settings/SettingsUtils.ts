import { ButtonBuilder, ButtonStyle, Interaction } from 'discord.js'
import NoirClient from '../../../../structures/Client'
export default class SettingsUtils {
  public static defaultStyle = ButtonStyle.Secondary
  public static primaryStyle = ButtonStyle.Primary
  public static successStyle = ButtonStyle.Success
  public static warningStyle = ButtonStyle.Danger

  public static generateId(name: string, id: string, label: string, type: componentTypes) {
    return `${name}-${id}-${label}-${type}`
  }

  public static generateStyle(data: any) {
    return data ? this.successStyle : this.defaultStyle
  }

  public static generateBack(name: string, id: string, label: string, status = false) {
    return new ButtonBuilder()
      .setCustomId(this.generateId(name, id, label, 'button'))
      .setLabel('Go back')
      .setStyle(this.defaultStyle)
      .setDisabled(status)
  }

  public static generateSave(name: string, id: string, label: string, status = false) {
    return new ButtonBuilder()
      .setCustomId(this.generateId(name, id, label, 'button'))
      .setLabel('Save data')
      .setStyle(this.primaryStyle)
      .setDisabled(status)
  }

  public static generateExample(name: string, id: string, label: string, status = false) {
    return new ButtonBuilder()
      .setCustomId(this.generateId(name, id, label, 'button'))
      .setLabel('Send example')
      .setStyle(this.primaryStyle)
      .setDisabled(status)
  }

  public static generateRestore(name: string, id: string, label: string, status = false) {
    return new ButtonBuilder()
      .setCustomId(this.generateId(name, id, label, 'button'))
      .setLabel('Restore last data')
      .setStyle(this.warningStyle)
      .setDisabled(status)
  }

  public static generateReset(name: string, id: string, label: string, status = false) {
    return new ButtonBuilder()
      .setCustomId(this.generateId(name, id, label, 'button'))
      .setLabel('Restart all data')
      .setStyle(this.warningStyle)
      .setDisabled(status)
  }

  public static formatImage(client: NoirClient, interaction: Interaction, value: string | undefined) {
    value = client.utils.removeFormatValue(value)

    if (client) {
      return value?.replace(/\{\{client avatar\}\}/g, client.user?.avatarURL({ size: 4096 }) ?? '')
    }

    if (interaction) {
      return value?.replace(/\{\{guild icon\}\}/g, interaction.guild?.iconURL({ size: 4096 }) ?? '')
        .replace(/\{\{user avatar\}\}/g, '{{user avatar}}')
    }

    return undefined
  }
}

export type componentTypes = 'button' | 'select' | 'modal' | 'input'