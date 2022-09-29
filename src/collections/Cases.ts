import NoirClient from '../structures/Client'
export default class Cases {
  private readonly _id: string
  private _data: CasesData

  constructor(id: string) {
    this._id = id
    this._data = {
      guild: id,
      overall: 0,
      restriction: 0,
      warning: 0,
      ban: 0,
      tempban: 0,
      sotfban: 0,
      kick: 0
    }
  }

  public get id() {
    return this._id
  }

  public get data() {
    return this._data
  }

  public async saveData(client: NoirClient) {
    let casesData = await client.prisma.cases.findFirst({
      where: { guild: this.id }
    })

    if (!casesData) {
      casesData = await client.prisma.cases.create({ data: this.data })
    }

    casesData = await client.prisma.cases.update({
      where: { guild: this.id },
      data: this.data
    })

    return this
  }

  public async cacheData(client: NoirClient) {
    let casesData = await client.prisma.cases.findFirst({
      where: { guild: this.id }
    })

    if (!casesData) {
      casesData = await client.prisma.cases.create({ data: this.data })
    }

    this._data = {
      guild: casesData.guild,
      overall: casesData.overall,
      restriction: casesData.restriction,
      warning: casesData.warning,
      ban: casesData.ban,
      tempban: casesData.tempban,
      sotfban: casesData.sotfban,
      kick: casesData.kick
    }

    return this
  }

  public static async getData(client: NoirClient, id: string) {
    let casesData = client.cases.get(id)

    if (!casesData) {
      client.cases.set(id, new Cases(id))
      casesData = await client.cases.get(id)?.cacheData(client)
    }

    return casesData as Cases
  }
}

export interface CasesData {
  guild: string
  overall: number
  restriction: number
  warning: number
  ban: number
  tempban: number
  sotfban: number
  kick: number
}