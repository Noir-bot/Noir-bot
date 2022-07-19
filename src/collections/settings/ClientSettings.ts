import { Client } from '@prisma/client'
import Colors from '../../constants/Colors'
import NoirClient from '../../structures/Client'

type ClientSettingsData = Omit<Client, 'id'>

export default class ClientSettings {
  private _id: string
  private _data: ClientSettingsData

  constructor(id: string) {
    this._id = id
    this._data = {
      guild: this._id,
      primaryColor: Colors.primaryHex,
      removeVariable: '{{remove}}',
      premiumEmoji: true
    }
  }

  public get id(): string {
    return this._id
  }

  public get data(): ClientSettingsData {
    return this._data
  }

  public async save(client: NoirClient): Promise<Client> {
    let clientData = await client.prisma.client.findFirst({
      where: {
        guild: this.id
      }
    })

    if (!clientData) {
      clientData = await client.prisma.client.create({
        data: this.data
      })
    }

    if (clientData) {
      await client.prisma.client.updateMany({
        where: {
          guild: this.id
        },
        data: this.data
      })
    }

    return clientData
  }
}
