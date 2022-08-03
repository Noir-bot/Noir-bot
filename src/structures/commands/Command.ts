import { ChatInputApplicationCommandData, CommandInteraction, MessageApplicationCommandData, PermissionResolvable, UserApplicationCommandData } from 'discord.js'
import NoirClient from '../Client'

export default abstract class Command {
  public client: NoirClient
  public abstract options: CommandOptions
  public abstract data: ChatInputApplicationCommandData | UserApplicationCommandData | MessageApplicationCommandData

  protected constructor(client: NoirClient) {
    this.client = client
  }

  public abstract execute(client: NoirClient, interaction: CommandInteraction): void
}

export interface CommandOptions {
  permissions: PermissionResolvable
  access: 'public' | 'private' | 'moderation' | 'premium'
  type: 'public' | 'private'
  status: boolean
}