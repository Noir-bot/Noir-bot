import Options from '@constants/Options'
import { PrismaClient } from '@prisma/client'
import Case from '@structures/Case'
import Event from '@structures/Event'
import Premium from '@structures/Premium'
import Save from '@structures/Save'
import Command from '@structures/commands/Command'
import Moderation from '@structures/moderation/Moderation'
import ModerationRules from '@structures/moderation/ModerationRules'
import Welcome from '@structures/welcome/Welcome'
import WelcomeMessage from '@structures/welcome/WelcomeMessage'
import { Client as BaseClient, Collection } from 'discord.js'
import glob from 'glob'
import { promisify } from 'util'

export default class Client extends BaseClient {
  public commands = new Collection<string, Command>()
  public events = new Collection<string, Event>()
  public premium = new Collection<string, Premium>()
  public save = new Collection<string, Save>()
  public welcome = new Collection<string, Welcome>()
  public welcomeMessages = new Collection<string, WelcomeMessage>()
  public moderation = new Collection<string, Moderation>()
  public moderationRules = new Collection<string, ModerationRules>()
  public moderationCases = new Collection<string, Case>()
  public channelLocks = new Collection<string, boolean>()
  // public periodicCases = new Collection<number, Date>()
  public rateLimits = new Collection<string, Date>()
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

    process.on('unhandledRejection', (error: Error) => {
      console.log('Unhandled rejection\n', error)
    })
  }
}