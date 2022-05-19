import chalk from 'chalk'
import glob from 'glob'
import { promisify } from 'util'
import NoirClient from '../../libs/structures/Client'
import NoirCommand from '../../libs/structures/Command'
import NoirEvent from '../../libs/structures/Event'
import { ActivityType, ApplicationCommandData, ChatInputApplicationCommandData } from 'discord.js'
import { guild } from '../../config/config'

export default class ReadyEvent extends NoirEvent {
	constructor(client: NoirClient) {
		super(client, 'ready', true)
	}

	public async execute(client: NoirClient) {
		console.log(chalk.green.bold('Noir Ready'))
		client?.user?.setActivity({
			name: 'Loid',
			type: ActivityType.Playing
		})

		await this.loadCommands(client, `${__dirname}/../../commands/**/**/*{.js,.ts}`)
	}

	private async loadCommands(client: NoirClient, path: string) {
		const globPromise = promisify(glob)
		const commandsFiles = await globPromise(path)

		commandsFiles.map(async (commandFile: string) => {
			const command = new (await import(commandFile)).default(client) as NoirCommand

			if (command.settings.type == 'private') {
				const commandData: ApplicationCommandData = {
					name: command.data.name,
					description: (command.data as ChatInputApplicationCommandData).description,
					options: (command.data as ChatInputApplicationCommandData).options,
					type: command.data.type
				}

				client.guilds.cache.get(guild)?.commands.create(commandData)
			}

			if (command.settings.type == 'public') {
				const commandData: ApplicationCommandData = {
					name: command.data.name,
					description: (command.data as ChatInputApplicationCommandData).description,
					options: (command.data as ChatInputApplicationCommandData)?.options,
					type: command.data.type
				}

				client.application?.commands.create(commandData)
			}

			client.noirCommands.set(command.data.name, command)
		})
	}

	// public async loadContext(client: NoirClient, path: string) {
	// 	const globPromise = promisify(glob)
	// 	const contextFiles: string[] = await globPromise(path)
	//
	// 	contextFiles.map(async (contextFile: string) => {
	// 		const command: NoirCommand = new (require(contextFile))(client) as NoirCommand
	//
	// 		if (command.settings.type === 'private') {
	// 			const commandData: NoirCommandAll = {
	// 				name: command.data.name,
	// 				type: (command.data as NoirCommandContext).type
	// 			}
	//
	// 			client.guilds.cache.get(noirGuild)?.commands.create(commandData)
	// 		}
	//
	// 		if (command.settings.type == 'public') {
	// 			const commandData: NoirCommandContext = {
	// 				name: command.data.name,
	// 				type: (command.data as NoirCommandContext).type
	// 			}
	//
	// 			client.application?.commands.create(commandData)
	// 		}
	//
	// 		client.noirCommands.set(command.data.name, command)
	// 	})
	// }
}