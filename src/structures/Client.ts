import { PrismaClient } from '@prisma/client'
import { Client, Collection, ForumChannel, ThreadAutoArchiveDuration } from 'discord.js'
import glob from 'glob'
import { promisify } from 'util'
import Options from '../constants/Options'
import Reply from '../libs/Reply'
import Utils from '../libs/Utils'
import Case from './Case'
import Event from './Event'
import Moderation from './Moderation'
import ModerationRules from './ModerationRules'
import Premium from './Premium'
import Welcome from './Welcome'
import WelcomeMessage from './WelcomeMessage'
import Command from './commands/Command'

export default class NoirClient extends Client {
  public commands = new Collection<string, Command>()
  public events = new Collection<string, Event>()
  public premium = new Collection<string, Premium>()
  public welcome = new Collection<string, Welcome>()
  public welcomeMessages = new Collection<string, WelcomeMessage>()
  public moderation = new Collection<string, Moderation>()
  public moderationRules = new Collection<string, ModerationRules>()
  public cases = new Collection<string, Case>()
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

      const errorChannel = this.channels.cache.get(Options.errorChannelId!) as ForumChannel

      errorChannel.threads.create({
        name: 'Uncaught exception error',
        appliedTags: ['1051854458239336489'],
        message: { content: this.utils.capitalize(error.stack ?? 'Message not provided') },
        autoArchiveDuration: ThreadAutoArchiveDuration.ThreeDays
      })
    })

    process.on('unhandledRejection', (error: Error) => {
      console.log('Unhandled rejection\n', error)

      const errorChannel = this.channels.cache.get(Options.errorChannelId!) as ForumChannel

      errorChannel.threads.create({
        name: 'Unhandled rejection error',
        appliedTags: ['1051855781475139694'],
        message: { content: this.utils.capitalize(error.stack ?? 'Message not provided') },
        autoArchiveDuration: ThreadAutoArchiveDuration.ThreeDays
      })
    })
  }
}