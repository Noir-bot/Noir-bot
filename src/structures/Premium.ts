import Client from '@structures/Client'
export default class Premium {
  public guild: string
  public expires: Date

  constructor(guild: string, expires: Date) {
    this.guild = guild
    this.expires = expires
  }

  public status() {
    return this.expires.getTime() >= new Date().getTime()
  }

  public static async save(client: Client, guild: string) {
    const cachedData = client.premium.get(guild)

    if (cachedData) {
      const data = await client.prisma.premium.findFirst({ where: { guild: cachedData.guild } })

      if (!data) {
        await client.prisma.premium.create({
          data: {
            guild: cachedData.guild,
            expires: cachedData.expires
          }
        })
      }

      else {
        await client.prisma.premium.updateMany({
          where: { guild: cachedData.guild },
          data: { expires: cachedData.expires }
        })
      }
    }

    return cachedData
  }

  public static async cache(client: Client, guild: string) {
    const cachedData = client.premium.get(guild)

    if (!cachedData) {
      let data = await client.prisma.premium.findFirst({ where: { guild: guild } })
      const expires = new Date()

      if (!data) {
        data = await client.prisma.premium.create({
          data: {
            guild: guild,
            expires: expires
          }
        })

        client.premium.set(guild, new Premium(guild, expires))
      }

      else {
        client.premium.set(guild, new Premium(guild, data.expires))
      }


      return client.premium.get(guild)!
    }

    return cachedData
  }
}