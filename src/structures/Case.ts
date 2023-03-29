import Client from '@structures/Client'
export default class Case {
  public id?: string
  public guild: string
  public action: CaseAction
  public user: string
  public moderator: string
  public reason?: string
  public duration?: number
  public reference?: string
  public expires?: Date
  public updated: Date
  public created: Date
  public resolved: boolean

  constructor(data: CaseData) {
    this.id = data.id
    this.guild = data.guild
    this.action = data.action
    this.user = data.user
    this.moderator = data.moderator
    this.reason = data.reason
    this.duration = data.duration
    this.reference = data.reference
    this.expires = data.expires
    this.updated = data.updated
    this.created = data.created
    this.resolved = data.resolved
  }

  public static async save(client: Client, data: CaseData, id: string) {
    const cachedCase = client.moderationCases.get(id)

    if (cachedCase) {
      const data = await client.prisma.case.create({
        data: {
          guild: cachedCase.guild,
          action: cachedCase.action,
          user: cachedCase.user,
          moderator: cachedCase.moderator,
          reason: cachedCase.reason,
          duration: cachedCase.duration,
          reference: cachedCase.reference,
          expires: cachedCase.expires,
          updated: cachedCase.updated,
          created: cachedCase.created,
          resolved: cachedCase.resolved
        }
      })

      client.moderationCases.delete(cachedCase.created.getTime().toString())

      return data
    }

    else return
  }
}

export interface CaseData {
  id?: string
  guild: string
  action: CaseAction
  user: string
  moderator: string
  reason?: string
  duration?: number
  reference?: string
  expires?: Date
  updated: Date
  created: Date
  resolved: boolean
}

export type CaseAction = 'warn' | 'timeout' | 'ban' | 'softban' | 'kick'