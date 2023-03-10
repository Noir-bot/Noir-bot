import Client from '@structures/Client'
import { ClientEvents } from 'discord.js'

export default abstract class Event {
  public client: Client
  public name: keyof ClientEvents
  public once: boolean

  protected constructor(client: Client, name: keyof ClientEvents, once: boolean) {
    this.client = client
    this.name = name
    this.once = once
  }

  public abstract execute(client: Client, ...args: unknown[]): void
}