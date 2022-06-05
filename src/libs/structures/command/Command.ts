import {
  ChatInputApplicationCommandData,
  CommandInteraction,
  MessageApplicationCommandData,
  PermissionResolvable,
  UserApplicationCommandData
} from 'discord.js'
import NoirClient from '../Client'

export default abstract class NoirCommand {
  public client: NoirClient
  public abstract settings: NoirCommandSettings
  public abstract data: ChatInputApplicationCommandData | UserApplicationCommandData | MessageApplicationCommandData

  protected constructor(client: NoirClient) {
    this.client = client
  }

  public abstract execute(client: NoirClient, interaction: CommandInteraction): void
}

export interface NoirCommandSettings {
  permissions: PermissionResolvable
  category: NoirCommandCategory
  access: NoirCommandAccess
  type: NoirCommandType
  status: boolean
}

type NoirCommandCategory = 'overall' | 'moderation' | 'information' | 'utility'
type NoirCommandAccess = 'public' | 'moderation' | 'premium' | 'private'
type NoirCommandType = 'public' | 'private'