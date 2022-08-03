import { ButtonStyle } from 'discord.js'
import NoirClient from '../structures/Client'
type componentTypes = 'button' | 'select' | 'modal' | 'input'

export default class ComponentUtils {
  public client: NoirClient

  constructor(client: NoirClient) {
    this.client = client
  }

  public defaultStyle = ButtonStyle.Secondary

  public generateId(name: string, id: string, label: string, type: componentTypes) {
    return `${name}-${id}-${label}-${type}`
  }

  public generateStyle(data: unknown | undefined | null) {
    return data ? ButtonStyle.Success : this.defaultStyle
  }
}