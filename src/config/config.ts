import { ClientOptions, Partials } from 'discord.js'
import * as dotenv from 'dotenv'

dotenv.config({ path: __dirname + '/../../.env' })

export const urlRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/i
export const durationRegex = /^(((\d|\d.\d){1,3})(s|secs?|seconds?|m|mins?|minutes?|h|hours?|d|days?|w|weeks?|y|yrs?|years?)){1,2}|permanent$/i
export const colorRegex = /^#[0-9A-F]{6}$/i
export const token: string = process.env.ENVIROEMENT == 'DEVELOPMENT' ? process.env.DEV_TOKEN! : process.env.TOKEN!
export const cluster: string = process.env.ENVIROEMENT == 'DEVELOPMENT' ? process.env.DEV_CLUSTER! : process.env.CLUSTER!
export const guild: string = process.env.ENVIROEMENT == 'DEVELOPMENT' ? process.env.DEV_GUILD! : process.env.GUILD!
export const owners: string[] = ['690728155052245072']
export const invite: string = 'https://discord.gg/HQjUYN3MDM'
export const founders: readonly string[] = ['690728155052245072']
export const blacklist: readonly string[] = []
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