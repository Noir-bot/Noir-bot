import { ActivityType, ClientOptions, Partials } from 'discord.js'
import * as dotenv from 'dotenv'

dotenv.config({ path: __dirname + '/../../.env' })

export default class Options {
  public static readonly token = process.env.ENVIRONMENT == 'DEVELOPMENT' ? process.env.DEV_TOKEN! : process.env.TOKEN!
  public static readonly cluster = process.env.ENVIRONMENT == 'DEVELOPMENT' ? process.env.DEV_CLUSTER! : process.env.CLUSTER!
  public static readonly guildId = process.env.ENVIRONMENT == 'DEVELOPMENT' ? process.env.DEV_GUILD! : process.env.GUILD!
  public static readonly guildInvite = process.env.INVITE!
  public static readonly owners = ['690728155052245072', '912298055963918416']
  public static readonly activity = 'Loid'
  public static readonly status = 'online'
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
      'GuildPresences',
      'DirectMessages',
      'GuildBans'
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