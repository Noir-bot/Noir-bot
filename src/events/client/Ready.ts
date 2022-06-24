import chalk from 'chalk'
import { ActivityType } from 'discord.js'
import glob from 'glob'
import { promisify } from 'util'
import { activity, guild } from '../../libs/config/settings'
import NoirClient from '../../libs/structures/Client'
import NoirCommand from '../../libs/structures/command/Command'
import NoirEvent from '../../libs/structures/event/Event'

export default class ReadyEvent extends NoirEvent {
  constructor(client: NoirClient) {
    super(client, 'ready', true)
  }

  public async execute(client: NoirClient) {
    console.log(chalk.green.bold('Noir Ready'))
    client?.user?.setActivity({
      name: `${activity}`,
      type: ActivityType.Listening
    })

    await this.loadCommands(client, `${__dirname}/../../commands/**/**/*{.js,.ts}`)
  }

  private async loadCommands(client: NoirClient, path: string) {
    const globPromise = promisify(glob)
    const commandsFiles = await globPromise(path)

    // Reset guild commands
    // client.guilds.cache.get(guild)?.commands.set([])

    commandsFiles.map(async (commandFile: string) => {
      const command = new (await import(commandFile)).default(client) as NoirCommand

      if (command.settings.type == 'private') {
        client.guilds.cache.get(guild)?.commands.create(command.data)
      }

      if (command.settings.type == 'public') {
        client.application?.commands.create(command.data)
      }

      client.noirCommands.set(command.data.name, command)
    })
  }
}