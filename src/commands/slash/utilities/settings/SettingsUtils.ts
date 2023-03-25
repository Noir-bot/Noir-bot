import Emojis from '@constants/Emojis'
import Client from '@structures/Client'
import Save from '@structures/Save'
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
      .setEmoji(Emojis.back)
      .setDisabled(status)
  }

  public static generateSave(name: string, id: string, label: string, client: Client, guild: string, type?: string, status = false) {
    const saves = Save.cache(client, `${guild}-${type}`)

    return new ButtonBuilder()
      .setCustomId(this.generateId(name, id, label, 'button'))
      .setLabel(`Save changes ${saves?.count ? `(${saves.count})` : ''}`)
      .setStyle(this.defaultStyle)
      .setEmoji(Emojis.save)
      .setDisabled(status)
  }

  public static generateExample(name: string, id: string, label: string, status = false) {
    return new ButtonBuilder()
      .setCustomId(this.generateId(name, id, label, 'button'))
      .setLabel('Example message')
      .setStyle(this.defaultStyle)
      .setEmoji(Emojis.preview)
      .setDisabled(status)
  }

  public static generateRestore(name: string, id: string, label: string, status = false) {
    return new ButtonBuilder()
      .setCustomId(this.generateId(name, id, label, 'button'))
      .setLabel('Refresh')
      .setEmoji(Emojis.refresh)
      .setStyle(this.defaultStyle)
      .setDisabled(status)
  }

  public static generateReset(name: string, id: string, label: string, status = false) {
    return new ButtonBuilder()
      .setCustomId(this.generateId(name, id, label, 'button'))
      .setLabel('Clear data')
      .setStyle(this.warningStyle)
      .setEmoji(Emojis.trash)
      .setDisabled(status)
  }
}

export type componentTypes = 'button' | 'select' | 'modal' | 'input'