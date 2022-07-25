import { PrismaClient } from '@prisma/client'
import { Client, Collection } from 'discord.js'
import glob from 'glob'
import { promisify } from 'util'
import EmbedConstructor from '../collections/EmbedConstructor'
import Premium from '../collections/Premium'
import LoggingSettings from '../commands/slash/utilities/settings/collections/LoggingSettings'
import WelcomeSettings from '../commands/slash/utilities/settings/collections/WelcomeSettings'
import Options from '../constants/Options'
import Reply from '../libs/Reply'
import Utils from '../libs/Utils'
import Command from './command/Command'
import Event from './Event'

export default class NoirClient extends Client {
  public commands = new Collection<string, Command>()
  public events = new Collection<string, Event>()
  public premium = new Collection<string, Premium>()
  public embeds = new Collection<string, EmbedConstructor>()
  public welcomeSettings = new Collection<string, WelcomeSettings>()
  public loggingSettings = new Collection<string, LoggingSettings>()

  public prisma = new PrismaClient()
  public utils = new Utils(this)
  public reply = new Reply(this)

  constructor() {
    super(Options.options)
  }

  public async start() {
    await this.prisma.$connect()
    await this.loadEvents(`${__dirname}/../events/**/*{.js,.ts}`)
    await this.login(Options.token)
    this.handleErrors()
  }

  private async loadEvents(path: string) {
    const globPromisify = promisify(glob)
    const eventFiles = await globPromisify(path)

    eventFiles.map(async (eventFile: string) => {
      try {
        const file = await import(eventFile)
        const event = new (file).default(this) as Event

        if (!event.execute) return

        this.events.set(event.name, event)

        if (event.once) {
          this.once(event.name, (...args) => event.execute(this, ...args))
        } else {
          this.on(event.name, (...args) => event.execute(this, ...args))
        }
      } catch {
        return
      }
    })
  }

  private handleErrors() {
    process.on('uncaughtException', (error) => {
      console.log('Uncaught exception\n', error)
    })

    process.on('unhandledRejection', (error) => {
      console.log('Unhandled rejection\n', error)
    })
  }
}