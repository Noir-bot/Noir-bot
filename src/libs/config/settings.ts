import { ClientOptions, Partials } from 'discord.js'
import * as dotenv from 'dotenv'

dotenv.config({ path: __dirname + '/../../.env' })

export const token: string = process.env.ENVIRONMENT == 'DEVELOPMENT' ? process.env.DEV_TOKEN! : process.env.TOKEN!
export const cluster: string = process.env.ENVIRONMENT == 'DEVELOPMENT' ? process.env.DEV_CLUSTER! : process.env.CLUSTER!
export const guild: string = process.env.ENVIRONMENT == 'DEVELOPMENT' ? process.env.DEV_GUILD! : process.env.GUILD!
export const invite: string = process.env.INVITE!

export const owners: readonly string[] = ['690728155052245072', '912298055963918416']

export const activity = 'Loid'
export const status = 'online'
export const settings: ClientOptions = {
  intents: [
    'Guilds',
    'GuildMembers',
    'GuildMessages',
    'GuildPresences',
    'GuildBans',
    'GuildVoiceStates',
    'DirectMessages'
  ],
  partials: [
    Partials.GuildMember,
    Partials.Message,
    Partials.Channel,
    Partials.User
  ],
  presence: {
    status: 'online'
  }
}