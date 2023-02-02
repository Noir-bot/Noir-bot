import NoirClient from './Client'
export default class Case {
  public guild: string
  public action: CaseAction
  public user: string
  public mod: string
  public reason?: string
  public duration?: number
  public reference?: string
  public expires?: Date
  public updated: Date
  public created: Date

  constructor(data: CaseData) {
    this.guild = data.guild
    this.action = data.action
    this.user = data.user
    this.mod = data.mod
    this.reason = data.reason
    this.duration = data.duration
    this.reference = data.reference
    this.expires = data.expires
    this.updated = data.updated
    this.created = data.created
  }

  public static async save(client: NoirClient, data: CaseData, id: string) {
    const cachedCase = client.cases.get(id)

    if (cachedCase) {
      await client.prisma.case.create({
        data: {
          guild: cachedCase.guild,
          action: cachedCase.action,
          user: cachedCase.user,
          mod: cachedCase.mod,
          reason: cachedCase.reason,
          duration: cachedCase.duration,
          reference: cachedCase.reference,
          expires: cachedCase.expires,
          updated: cachedCase.updated,
          created: cachedCase.created
        }
      })

      client.cases.delete(cachedCase.created.getTime().toString())
    }

    else return

    return cachedCase
  }
}

export interface CaseData {
  guild: string
  action: CaseAction
  user: string
  mod: string
  reason?: string
  duration?: number
  reference?: string
  expires?: Date
  updated: Date
  created: Date
}

export type CaseAction = 'warn' | 'timeout' | 'ban' | 'tempban' | 'softban' | 'unban' | 'kick'