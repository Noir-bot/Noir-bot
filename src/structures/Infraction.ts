import Client from '@structures/Client'

export default class Infraction {
  public guild: string
  public user: string
  public cases: InfractionCase[]
  public page: number

  constructor(guild: string, user: string, cases: InfractionCase[]) {
    this.guild = guild
    this.user = user
    this.cases = cases
    this.page = 1
  }

  public get id() {
    return this.guild + '.' + this.user
  }

  public static generateId(id: string, page: number, action: string) {
    return `infractions-${id}-${page}-${action}`
  }

  public getCasesByPage(page: number) {
    const cases = this.cases.slice((page - 1) * 5, page * 5)
    const nextPageStatus = this.cases.length > page * 5
    const prevPageStatus = page > 1

    return { cases, nextPageStatus, prevPageStatus }
  }

  public static async cache(client: Client, guild: string, user: string, force = false) {
    const infractionData = client.infractions.get(user + '.' + guild)

    if (!infractionData || force) {
      const infractionsQuery = await client.prisma.case.findMany({
        where: {
          guild: guild,
          user: user
        }
      })

      if (!infractionsQuery) return

      const infractions = infractionsQuery.map(data => {
        return {
          id: data.id,
          guild: data.guild,
          user: data.user,
          action: data.action,
          reason: data.reason
        } as InfractionCase
      })

      return client.infractions.set(user + '.' + guild, new Infraction(guild, user, infractions)).get(user + '.' + guild)!
    }

    return infractionData
  }
}

interface InfractionCase {
  id: number
  guild: string
  user: string
  action: string
  reason: string | null
}