import { ClientEvents } from 'discord.js'
import NoirClient from '../Client'

export default abstract class NoirEvent {
  public client: NoirClient
  public name: keyof ClientEvents
  public once: boolean

  protected constructor(client: NoirClient, name: keyof ClientEvents, once: boolean) {
    this.client = client
    this.name = name
    this.once = once
  }

  public abstract execute(client: NoirClient, ...args: unknown[]): void
}