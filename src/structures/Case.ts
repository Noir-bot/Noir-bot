export default class Case {
  public id?: string
  public guild: string
  public user: string
  public mod: string
  public action: CaseType
  public reason?: string
  public reference?: string
  public logs?: string
  public duration?: number
  public expires?: Date
  public updated: Date
  public created: Date

  constructor(data: CaseData) {
    this.guild = data.guild
    this.user = data.user
    this.mod = data.mod
    this.action = data.action
    this.reason = data.reason
    this.reference = data.reference
    this.logs = data.logs
    this.duration = data.duration
    this.expires = data.expires
    this.updated = data.updated ?? new Date()
    this.created = data.created ?? new Date()
  }
}

export type CaseType = 'ban' | 'kick' | 'warn' | 'restriction' | 'softban' | 'tempban'

export type CaseData = Omit<Case, 'created'> & { created?: Date }