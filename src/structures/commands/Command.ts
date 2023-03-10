import Client from '@structures/Client'
import { ChatInputApplicationCommandData, CommandInteraction, MessageApplicationCommandData, PermissionResolvable, UserApplicationCommandData } from 'discord.js'

export default abstract class Command {
  public client: Client
  public abstract options: CommandOptions
  public abstract data: ChatInputApplicationCommandData | UserApplicationCommandData | MessageApplicationCommandData

  protected constructor(client: Client) {
    this.client = client
  }

  public abstract execute(client: Client, interaction: CommandInteraction): void
}

export interface CommandOptions {
  permissions: PermissionResolvable
  access: 'public' | 'private' | 'moderation' | 'premium'
  type: 'public' | 'private'
  status: boolean
}