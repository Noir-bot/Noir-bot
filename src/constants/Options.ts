import { ClientOptions, Partials } from 'discord.js'
import * as dotenv from 'dotenv'

dotenv.config({ path: __dirname + '/../../.env' })

export default class Options {
  public static readonly token = process.env.TOKEN!
  public static readonly version = process.env.VERSION!
  public static readonly guildId = process.env.GUILD_ID!
  public static readonly guildInvite = process.env.GUILD_INVITE!
  public static readonly clientId = process.env.CLIENT_ID!
  public static readonly clientInvite = process.env.CLIENT_INVITE!
  public static readonly supportId = process.env.SUPPORT_ID!
  public static readonly docsLink = process.env.DOCS!
  public static readonly patreonLink = process.env.PATREON!
  public static readonly buyMeACoffeeLink = process.env.COFFEE!
  public static readonly owners = ['690728155052245072', '912298055963918416']
  public static readonly options: ClientOptions = {
    partials: [
      Partials.GuildMember,
      Partials.Message,
      Partials.Channel,
      Partials.User
    ],
    intents: [
      'Guilds',
      'GuildMembers',
      'GuildMessages',
      'DirectMessages',
      'GuildPresences',
      'GuildWebhooks',
      'GuildBans',
    ],
  }
  private static _maintenance = false
  public static get maintenance() { return this._maintenance }
  public static set maintenance(status: boolean) { this._maintenance = status }
}