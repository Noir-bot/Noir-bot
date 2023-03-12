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

export const enum AccessType {
  Public = "public",
  Private = "prviate",
  Moderation = "moderation",
  Premium = "premium",
}

export const enum CommandType {
  Public = "public",
  Private = "private",
}

export interface CommandOptions {
  permissions: PermissionResolvable
  access: AccessType
  type: CommandType
  status: boolean
}
