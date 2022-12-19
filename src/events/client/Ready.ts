import chalk from 'chalk'
import { ActivityType } from 'discord.js'
import glob from 'glob'
import { promisify } from 'util'
import Options from '../../constants/Options'
import NoirClient from '../../structures/Client'
import Command from '../../structures/commands/Command'
import Event from '../../structures/Event'

export default class ReadyEvent extends Event {
  constructor(client: NoirClient) {
    super(client, 'ready', true)
  }

  public async execute(client: NoirClient) {
    console.log(chalk.green.bold('Noir Ready!'))

    client?.user?.setActivity({
      name: `${Options.activity}`,
      type: ActivityType.Listening
    })

    await this.loadCommands(client, `${__dirname}/../../commands/**/**/*{.js,.ts}`)
  }

  private async loadCommands(client: NoirClient, path: string) {
    const globPromise = promisify(glob)
    const commandsFiles = await globPromise(path)

    // Reset guild commands
    // client.guilds.cache.get(Options.guildId)?.commands.set([])
    // client.application?.commands.set([])

    commandsFiles.forEach(async (commandFile: string) => {
      try {
        const file = await import(commandFile)
        const command = new file.default(client) as Command

        if (!command.execute) return

        if (command.options.type == 'private') {
          client.guilds.cache.get(Options.guildId)?.commands.create(command.data)
        }

        if (command.options.type == 'public') {
          client.application?.commands.create(command.data)
        }

        client.commands.set(command.data.name, command)
      } catch {
        return
      }
    })
  }
} 