import { Logging } from '@prisma/client'
import NoirClient from '../../../../../structures/Client'

type LoggingSettingsData = Omit<Logging, 'id'>

export default class LoggingSettings {
  private _id: string
  private _data: LoggingSettingsData

  constructor(id: string) {
    this._id = id
    this._data = {
      guild: this._id,
      status: false,
      events: {
        status: false,
        restriction: true,
        warning: true,
        kick: true,
        ban: true,
        createRole: true,
        deleteRole: true,
        updateMessage: true,
        deleteMessage: true
      }
    }
  }

  public get id(): string {
    return this._id
  }

  public get data(): LoggingSettingsData {
    return this._data
  }

  public async save(client: NoirClient): Promise<Logging> {
    let loggingData = await client.prisma.logging.findFirst({
      where: {
        guild: this.id
      }
    })

    if (!loggingData) {
      loggingData = await client.prisma.logging.create({
        data: this.data
      })
    }

    if (loggingData) {
      await client.prisma.logging.updateMany({
        where: {
          guild: this.id
        },
        data: this.data
      })
    }

    return loggingData
  }

  public async get(client: NoirClient) {
    let loggingData = await client.prisma.logging.findFirst({
      where: {
        guild: this.id
      }
    })

    if (!loggingData) {
      loggingData = await client.prisma.logging.create({
        data: this.data
      })
    }

    this._data = loggingData

    return loggingData
  }
}