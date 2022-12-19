import { ActivityType, ClientOptions, Partials } from 'discord.js'
import * as dotenv from 'dotenv'

dotenv.config({ path: __dirname + '/../../.env' })

export default class Options {
  public static readonly token = process.env.ENVIRONMENT == 'DEVELOPMENT' ? process.env.DEV_TOKEN! : process.env.TOKEN!
  public static readonly cluster = process.env.ENVIRONMENT == 'DEVELOPMENT' ? process.env.DEV_CLUSTER! : process.env.CLUSTER!
  public static readonly guildId = process.env.ENVIRONMENT == 'DEVELOPMENT' ? process.env.DEV_GUILD! : process.env.GUILD!
  public static readonly errorChannelId = process.env.ERROR_CHANNEL_ID
  public static readonly loidAvatar = 'https://cdn.discordapp.com/avatars/690728155052245072/da5d06534afcc88e5cbdf50b15c6d487.png?size=4096'
  public static readonly clientAvatar = 'https://cdn.discordapp.com/avatars/905923544687464448/26900c0b67f2a6c047b356e966eb24d6.png?size=4096'
  public static readonly github = 'https://github.com/loidnoir/noir-bot'
  public static readonly guildInvite = process.env.INVITE!
  public static readonly owners = ['690728155052245072', '912298055963918416']
  public static readonly activity = 'Loid'
  public static readonly status = 'online'
  public static readonly removeValue = '{{remove}}'
  public static readonly premiumEmoji = '⭐'
  public static readonly embedFieldsLimit = 25
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