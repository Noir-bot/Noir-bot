import { ActivityType, ClientOptions, Partials } from 'discord.js'
import * as dotenv from 'dotenv'

dotenv.config({ path: __dirname + '/../../.env' })

export default class Options {
  public static readonly version = process.env.VERSION!
  public static readonly token = process.env.TOKEN!
  public static readonly cluster = process.env.DATABASE!
  public static readonly guildId = process.env.GUILD_ID!
  public static readonly guildInvite = process.env.GUILD_INVITE!
  public static readonly botInvite = process.env.BOT_INVITE!
  public static readonly clientId = process.env.CLIENT_ID!
  public static readonly avatar = 'https://cdn.discordapp.com/avatars/690728155052245072/da5d06534afcc88e5cbdf50b15c6d487.png?size=4096'
  public static readonly docsLink = process.env.DOCS!
  public static readonly owners = ['690728155052245072', '912298055963918416']
  public static readonly activity = 'the world'
  public static readonly status = 'online'
  public static readonly removeValue = '{{remove}}'
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
    presence: {
      status: this.status,
      activities: [{ name: this.activity, type: ActivityType.Playing }]
    }
  }
  private static _maintenance = false
  public static get maintenance() { return this._maintenance }
  public static set maintenance(status: boolean) { this._maintenance = status }
}