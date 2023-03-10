import Client from '@structures/Client'

export default class ModerationRules {
  public rules: ModerationRule[]

  public constructor(rules: ModerationRule[]) {
    this.rules = rules
  }

  public static async save(client: Client, guildId: string) {
    const cache = client.moderationRules.get(guildId)
    console.log(cache)

    if (cache && cache.rules.length > 0) {
      const data = await client.prisma.rule.findMany({ where: { guild: guildId } })

      if (!data) {
        await client.prisma.rule.createMany({
          data: cache.rules.map(rule => {
            return {
              guild: rule.guild,
              action: rule.action,
              quantity: rule.quantity,
              duration: rule.duration
            }
          })
        })
      }

      else {
        await client.prisma.rule.createMany({
          data: cache.rules.map(rule => {
            return {
              guild: rule.guild,
              action: rule.action,
              quantity: rule.quantity,
              duration: rule.duration
            }
          })
        })

        try {
          await client.prisma.rule.updateMany({
            where: { guild: guildId }, data: cache.rules.map(rule => {
              return {
                guild: rule.guild,
                action: rule.action,
                quantity: rule.quantity,
                duration: rule.duration
              }
            })
          })
        } catch (err) {
          console.log(err)
        }
      }
    }

    return cache
  }

  public static async cache(client: Client, guildId: string, force?: boolean) {
    const cache = client.moderationRules.get(guildId)

    if (!cache || force) {
      let data = await client.prisma.rule.findMany({ where: { guild: guildId } })

      if (!data) return

      client.moderationRules.set(guildId, new ModerationRules(data.map((rule) => {
        return {
          id: rule.id,
          guild: rule.guild,
          action: rule.action,
          quantity: rule.quantity,
          duration: rule.duration as undefined | string
        }
      })))

      return client.moderationRules.get(guildId)!
    }

    return cache
  }
}

export type ModerationRuleTypes = 'ban' | 'kick' | 'timeout' | 'tempban' | 'softban'

export const ModerationRuleRegex = /ban|kick|timeout|tempban|softban/g

export interface ModerationRule {
  id: number
  guild: string
  action: string
  quantity: number
  duration?: string
}