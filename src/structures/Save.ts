import NoirClient from './Client'
export default class Save {

  public guild: string
  public count: number

  constructor(guild: string, count: number) {
    this.guild = guild
    this.count = count
  }

  public static cache(client: NoirClient, id: string) {
    let saves = client.save.get(id)

    if (!saves) {
      client.save.set(id, new Save(id, 0))

      return client.save.get(id)!
    }

    return saves
  }
}