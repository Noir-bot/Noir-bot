export default class Case {
  private readonly _id: number
  public data: CaseData

  constructor(id: number, data: CaseData) {
    this._id = id
    this.data = data
  }

  public get id() {
    return this._id
  }
}

export interface CaseData {
  caseId: number
  guild: string
  type: 'warn' | 'restriction' | 'ban' | 'tempban' | 'softban' | 'kick'
  user: string
  moderator: string
  reason?: string
  duration?: string
  created: Date
  expired?: Date
  edited?: Date
  reference?: string
  message?: string
}