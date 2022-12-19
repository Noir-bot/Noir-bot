import { ButtonBuilder, ButtonStyle } from 'discord.js'
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
}

export type componentTypes = 'button' | 'select' | 'modal' | 'input'