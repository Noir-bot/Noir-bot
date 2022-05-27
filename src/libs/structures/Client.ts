import { Client, Collection } from 'discord.js'
import mongoose from 'mongoose'
import { cluster, settings, token } from '../../config/config'
import NoirReply from '../utils/Reply'
import NoirUtils from '../utils/Utils'
import NoirCommand from './commands/Command'
import NoirEvent from './Event'
import { promisify } from 'util'
import glob from 'glob'
import chalk from 'chalk'

export default class NoirClient extends Client {
	public noirCommands = new Collection<string, NoirCommand>()
	public noirEvents = new Collection<string, NoirEvent>()
	public noirUtils = new NoirUtils(this)
	public noirReply = new NoirReply(this)
	public noirMaintenance = false

	constructor() {
		super(settings)
	}

	public async start() {
		await mongoose.connect(cluster).then(() => console.log(chalk.green.bold('Database ready!')))
		await this.loadEvents(`${__dirname}/../../events/**/*{.js,.ts}`)
		await this.login(token)

		process.on('uncaughtException', (error) => {
			console.log('Uncaught exception\n', error)
		})

		process.on('unhandledRejection', (error) => {
			console.log('Unhandled rejection\n', error)
		})
	}

	public async loadEvents(path: string) {
		const globPromisify = promisify(glob)
		const eventFiles = await globPromisify(path)

		eventFiles.map(async (eventFile: string) => {
			const event = new (await import(eventFile)).default(this) as NoirEvent
			this.noirEvents.set(event.name, event)

			if (event.once) {
				this.once(event.name, (...args) => event.execute(this, ...args))
			} else {
				this.on(event.name, (...args) => event.execute(this, ...args))
			}
		})
	}
}