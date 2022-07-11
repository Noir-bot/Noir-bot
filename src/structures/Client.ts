import { PrismaClient } from '@prisma/client'
import { Client, Collection } from 'discord.js'
import glob from 'glob'
import { promisify } from 'util'
import MessageConstructor from '../collections/MessageConstructor'
import Premium from '../collections/Premium'
import NoirRestriction from '../collections/Restriction'
import Options from '../constants/Options'
import Reply from '../libs/Reply'
import Utils from '../libs/Utils'
import Command from './command/Command'
import { default as Event, default as NoirEvent } from './Event'

export default class NoirClient extends Client {
  public commands = new Collection<string, Command>()
  public events = new Collection<string, NoirEvent>()
  public premium = new Collection<string, Premium>()
  public messages = new Collection<string, MessageConstructor>()
  public restrictions = new Collection<string, NoirRestriction>()

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
      const event = new (await import(eventFile)).default(this) as Event
      this.events.set(event.name, event)

      if (event.once) {
        this.once(event.name, (...args) => event.execute(this, ...args))
      } else {
        this.on(event.name, (...args) => event.execute(this, ...args))
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