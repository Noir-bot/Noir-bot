import Colors from '@constants/Colors'
import Emojis from '@constants/Emojis'
import Logs from '@helpers/Logs'
import { Duration } from '@sapphire/time-utilities'
import Client from '@structures/Client'
import { Message, time } from 'discord.js'

export default class WarnRule {
  public static async check(client: Client, guild: string, user: string, id: string) {
    const caseQuantity = await client.prisma.case.count({
      where: {
        guild: guild,
        user: user,
        action: 'warn'
      }
    })

    if (!caseQuantity) return

    const rule = await client.prisma.rule.findFirst({
      where: {
        guild: guild,
        quantity: caseQuantity,

      }
    })

    if (rule) {
      const ruleData = await client.prisma.rule.findFirst({
        where: {
          guild: guild,
          quantity: caseQuantity
        }
      })

      if (!ruleData) return

      if (ruleData.action == 'ban') {
        this.banResponse(client, guild, user, false)
      }

      else if (ruleData.action == 'softban') {
        this.banResponse(client, guild, user, true)
      }

      else if (ruleData.action == 'tempban' && ruleData.duration) {
        this.banResponse(client, guild, user, false, ruleData.duration)
      }

      else if (ruleData.action == 'timeout' && ruleData.duration) {
        this.timeoutResponse(client, guild, user, ruleData.duration)
      }

      else if (ruleData.action == 'kick') {
        this.kickResponse(client, guild, user)
      }
    }
  }

  public static async banResponse(client: Client, guild: string, user: string, softban: boolean, duration?: string | null) {
    const guildData = client.guilds.cache.get(guild)
    const member = guildData?.members.cache.get(user)
    const created = new Date()

    if (!member?.bannable) return

    const description = `${Emojis.rulebrekaer} User: ${client.users.cache.get(user)?.username} \`${user}\`\n` +
      `${Emojis.document} Reason: User reached the limit of mod-rule\n` +
      `${Emojis.time} Created at: ${time(created, 'd')} ${time(created, 'R')}\n` +
      `${Emojis.time} Updated at: ${time(created, 'd')} ${time(created, 'R')}\n` +
      `${duration ? `${Emojis.time} Expires at: ${time(new Duration(duration).fromNow, 'd')} ${time(new Duration(duration).fromNow, 'R')}\n` : ''}`

    const message = await Logs.log({
      client,
      guild: guild,
      author: `Auto ${softban ? 'soft' : duration ? 'temp' : ''}ban case`,
      color: Colors.primary,
      description: description
    }) as Message

    const caseData = await client.prisma.case.create({
      data: {
        action: softban ? 'softban' : duration ? 'tempban' : 'ban',
        guild: guild,
        moderator: client.user?.id!,
        user: user,
        reason: 'Auto-ban for reaching the warn limit.',
        reference: message.id,
        expires: duration ? new Duration(duration).fromNow : null,
        duration: duration ? new Duration(duration).offset : null,
        created: new Date(),
        updated: new Date()
      }
    })

    // if (caseData.action == 'tempban' && caseData.expires) {
    //   client.periodicCases.set(caseData.id, caseData.expires)
    // }

    await Logs.log({
      client,
      guild: guild,
      author: `Auto ${softban ? 'soft' : duration ? 'temp' : ''}ban case`,
      color: Colors.primary,
      description: description,
      footer: `Case ID: ${caseData.id}`,
      reference: message
    }) as Message

    if (softban && member) {
      await member.ban({ deleteMessageSeconds: 604800 })
      await guildData?.bans.remove(user)
    }

    else {
      member.ban()
    }
  }

  public static async timeoutResponse(client: Client, guild: string, user: string, duration: string) {
    const created = new Date()
    const guildData = client.guilds.cache.get(guild)
    const member = guildData?.members.cache.get(user)

    if (!member?.moderatable) return
    if (!new Duration(duration).offset) return

    const description = `${Emojis.rulebrekaer} User: ${client.users.cache.get(user)?.username} \`${user}\`\n` +
      `${Emojis.document} Reason: User reached the limit of mod-rule\n` +
      `${Emojis.time} Created at: ${time(created, 'd')} ${time(created, 'R')}\n` +
      `${Emojis.time} Updated at: ${time(created, 'd')} ${time(created, 'R')}\n` +
      `${duration ? `${Emojis.time} Expires at: ${time(new Duration(duration).fromNow, 'd')} ${time(new Duration(duration).fromNow, 'R')}\n` : ''}`

    const message = await Logs.log({
      client,
      guild: guild,
      author: 'Auto timeout case',
      color: Colors.primary,
      description: description
    }) as Message

    const caseData = await client.prisma.case.create({
      data: {
        action: 'timeout',
        guild: guild,
        moderator: client.user?.id!,
        user: user,
        created: new Date(),
        updated: new Date(),
        reason: 'Auto-timeout for reaching the warn limit.',
        reference: message.id,
        expires: new Duration(duration).fromNow,
        duration: new Duration(duration).offset
      }
    })

    await Logs.log({
      client,
      guild: guild,
      author: 'Auto timeout case',
      color: Colors.primary,
      description: description,
      footer: `Case ID: ${caseData.id}`,
      reference: message
    }) as Message

    member.timeout(new Duration(duration).offset)
  }

  public static async kickResponse(client: Client, guild: string, user: string) {
    const created = new Date()
    const guildData = client.guilds.cache.get(guild)
    const member = guildData?.members.cache.get(user)

    if (!member?.moderatable) return

    const description = `${Emojis.rulebrekaer} User: ${client.users.cache.get(user)?.username} \`${user}\`\n` +
      `${Emojis.document} Reason: User reached the limit of mod-rule\n` +
      `${Emojis.time} Created at: ${time(created, 'd')} ${time(created, 'R')}\n` +
      `${Emojis.time} Updated at: ${time(created, 'd')} ${time(created, 'R')}\n`

    const message = await Logs.log({
      client,
      guild: guild,
      author: 'Auto kick case',
      color: Colors.primary,
      description: description
    }) as Message

    const caseData = await client.prisma.case.create({
      data: {
        action: 'timeout',
        guild: guild,
        moderator: client.user?.id!,
        user: user,
        created: new Date(),
        updated: new Date(),
        reason: 'Auto-kick for reaching the warn limit.',
        reference: message.id ?? null,
      }
    })

    await Logs.log({
      client,
      guild: guild,
      author: 'Auto kick case',
      color: Colors.primary,
      description: description,
      footer: `Case ID: ${caseData.id}`,
      reference: message
    }) as Message

    member.kick()
  }
}