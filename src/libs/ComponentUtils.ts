import { ButtonStyle } from 'discord.js'
type componentTypes = 'button' | 'select' | 'modal' | 'input'

export default class ComponentUtils {
  public static defaultStyle = ButtonStyle.Secondary

  public static generateId(name: string, id: string, label: string, type: componentTypes) {
    return `${name}-${id}-${label}-${type}`
  }

  public static generateStyle(data: unknown | undefined | null) {
    return data ? ButtonStyle.Success : this.defaultStyle
  }
}