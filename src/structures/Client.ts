import { PrismaClient } from '@prisma/client'
import { Client, Collection } from 'discord.js'
import glob from 'glob'
import { promisify } from 'util'
import Case from '../collections/Case'
import Cases from '../collections/Cases'
import Premium from '../collections/Premium'
import ModerationCollection from '../commands/slash/utilities/settings/collections/ModerationCollection'
import WelcomeSettingsCollection from '../commands/slash/utilities/settings/collections/WelcomeCollection'
import Options from '../constants/Options'
import Reply from '../libs/Reply'
import Utils from '../libs/Utils'
import Command from './commands/Command'
import Event from './Event'

export default class NoirClient extends Client {
  public welcomeSettings = new Collection<string, WelcomeSettingsCollection>()
  public moderationSettings = new Collection<string, ModerationCollection>()
  public commands = new Collection<string, Command>()
  public premium = new Collection<string, Premium>()
  public events = new Collection<string, Event>()
  public cases = new Collection<string, Cases>()
  public case = new Collection<number, Case>()
  public utils = new Utils(this)
  public reply = new Reply(this)
  public prisma = new PrismaClient()

  constructor() {
    super(Options.options)
  }

  public async start() {
    await this.prisma.$connect()
    await this.loadEvents(`${__dirname}/../events/**/**/*{.js,.ts}`)
    await this.login(Options.token)
    this.handleErrors()
  }

  private async loadEvents(path: string) {
    const globPromisify = promisify(glob)
    const eventFiles = await globPromisify(path)

    eventFiles.forEach(async (eventFile: string) => {
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
      } catch (err) {
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