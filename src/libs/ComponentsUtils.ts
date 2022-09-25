import { ButtonBuilder, ButtonStyle } from 'discord.js'
import NoirClient from '../structures/Client'

type componentTypes = 'button' | 'select' | 'modal' | 'input'

export default class ComponentsUtils {
  public client: NoirClient
  public defaultStyle = ButtonStyle.Secondary
  public primaryStyle = ButtonStyle.Primary
  public dangerStyle = ButtonStyle.Danger

  constructor(client: NoirClient) {
    this.client = client
  }

  public generateId(name: string, id: string, label: string, type: componentTypes) {
    return `${name}-${id}-${label}-${type}`
  }

  public generateStyle(data: unknown | undefined | null) {
    return data ? ButtonStyle.Success : this.defaultStyle
  }

  public generateBack(name: string, id: string, label: string, status = false) {
    return new ButtonBuilder()
      .setCustomId(this.generateId(name, id, label, 'button'))
      .setLabel('Go back')
      .setStyle(this.defaultStyle)
      .setDisabled(status)
  }

  public generateSave(name: string, id: string, label: string, status = false) {
    return new ButtonBuilder()
      .setCustomId(this.generateId(name, id, label, 'button'))
      .setLabel('Save data')
      .setStyle(this.primaryStyle)
      .setDisabled(status)
  }

  public generateExample(name: string, id: string, label: string, status = false) {
    return new ButtonBuilder()
      .setCustomId(this.generateId(name, id, label, 'button'))
      .setLabel('Send example')
      .setStyle(this.primaryStyle)
      .setDisabled(status)
  }

  public generateRestore(name: string, id: string, label: string, status = false) {
    return new ButtonBuilder()
      .setCustomId(this.generateId(name, id, label, 'button'))
      .setLabel('Restore last data')
      .setStyle(this.dangerStyle)
      .setDisabled(status)
  }

  public generateReset(name: string, id: string, label: string, status = false) {
    return new ButtonBuilder()
      .setCustomId(this.generateId(name, id, label, 'button'))
      .setLabel('Restart all data')
      .setStyle(this.dangerStyle)
      .setDisabled(status)
  }
}