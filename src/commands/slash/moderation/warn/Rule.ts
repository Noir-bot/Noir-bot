import { Duration } from '@sapphire/time-utilities'
import { Message, time } from 'discord.js'
import Colors from '../../../../constants/Colors'
import NoirClient from '../../../../structures/Client'

export default class WarnRule {
  public static async check(client: NoirClient, guild: string, user: string) {
    const rules = await client.prisma.rule.findMany({
      where: {
        guild: guild
      }
    })

    if (rules) {
      const warns = await client.prisma.case.findMany({
        where: {
          action: 'warn',
          user: user,
          guild: guild
        }
      })

      let suitable

      for (const rule of rules) {
        if (warns.length == rule.quantity) {
          suitable = rule
        }
      }

      if (!suitable) return

      if (suitable.action == 'ban') {
        this.banResponse(client, guild, user, false)
      }

      else if (suitable.action == 'softban') {
        this.banResponse(client, guild, user, true)
      }

      else if (suitable.action == 'tempban' && suitable.duration) {
        this.banResponse(client, guild, user, false, suitable.duration)
      }

      else if (suitable.action == 'timeout' && suitable.duration) {
        this.timeoutResponse(client, guild, user, suitable.duration)
      }

      else if (suitable.action == 'kick') {
        this.kickResponse(client, guild, user)
      }
    }
  }

  public static async banResponse(client: NoirClient, guild: string, user: string, softban: boolean, duration?: string | null) {
    const created = new Date()
    const guildData = client.guilds.cache.get(guild)
    const member = guildData?.members.cache.get(user)

    if (!member?.bannable) return

    const description = `**User:** ${client.users.cache.get(user)?.username} \`${user}\`\n` +
      `**Reason:** User reached the limit of mod-rule\n` +
      `**Created at:** ${time(created, 'd')} ${time(created, 'R')}\n` +
      `**Updated at:** ${time(created, 'd')} ${time(created, 'R')}\n` +
      `${duration ? `**Expires at:** ${time(new Duration(duration).offset, 'd')} ${time(new Duration(duration).offset, 'R')}\n` : ''}`

    const message = await client.logs.log({
      guild: guild,
      author: `Auto ${softban ? 'soft' : duration ? 'temp' : ''}ban case`,
      color: Colors.tertiary,
      description: description
    }) as Message

    const caseData = await client.prisma.case.create({
      data: {
        action: softban ? 'softban' : duration ? 'tempban' : 'ban',
        guild: guild,
        mod: client.user?.id!,
        user: user,
        created: new Date(),
        updated: new Date(),
        reason: 'Auto-ban for reaching the warn limit.',
        reference: message.id,
        expires: duration ? new Duration(duration).fromNow : null,
        duration: duration ? new Duration(duration).offset : null,
      }
    })

    await client.logs.log({
      guild: guild,
      author: `Auto ${softban ? 'soft' : duration ? 'temp' : ''}ban case`,
      color: Colors.tertiary,
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

  public static async timeoutResponse(client: NoirClient, guild: string, user: string, duration: string) {
    const created = new Date()
    const guildData = client.guilds.cache.get(guild)
    const member = guildData?.members.cache.get(user)

    if (!member?.moderatable) return
    if (!new Duration(duration).offset) return

    const description = `**User:** ${client.users.cache.get(user)?.username} \`${user}\`\n` +
      `**Reason:** User reached the limit of mod-rule\n` +
      `**Created at:** ${time(created, 'd')} ${time(created, 'R')}\n` +
      `**Updated at:** ${time(created, 'd')} ${time(created, 'R')}\n` +
      `${duration ? `**Expires at:** ${time(new Duration(duration).fromNow, 'd')} ${time(new Duration(duration).fromNow, 'R')}\n` : ''}`

    const message = await client.logs.log({
      guild: guild,
      author: 'Auto timeout case',
      color: Colors.tertiary,
      description: description
    }) as Message

    const caseData = await client.prisma.case.create({
      data: {
        action: 'timeout',
        guild: guild,
        mod: client.user?.id!,
        user: user,
        created: new Date(),
        updated: new Date(),
        reason: 'Auto-timeout for reaching the warn limit.',
        reference: message.id,
        expires: new Duration(duration).fromNow,
        duration: new Duration(duration).offset,
      }
    })

    await client.logs.log({
      guild: guild,
      author: 'Auto timeout case',
      color: Colors.tertiary,
      description: description,
      footer: `Case ID: ${caseData.id}`,
      reference: message
    }) as Message

    member.timeout(new Duration(duration).offset)
  }

  public static async kickResponse(client: NoirClient, guild: string, user: string) {
    const created = new Date()
    const guildData = client.guilds.cache.get(guild)
    const member = guildData?.members.cache.get(user)

    if (!member?.moderatable) return

    const description = `**User:** ${client.users.cache.get(user)?.username} \`${user}\`\n` +
      `**Reason:** User reached the limit of mod-rule\n` +
      `**Created at:** ${time(created, 'd')} ${time(created, 'R')}\n` +
      `**Updated at:** ${time(created, 'd')} ${time(created, 'R')}\n`

    const message = await client.logs.log({
      guild: guild,
      author: 'Auto kick case',
      color: Colors.tertiary,
      description: description
    }) as Message

    const caseData = await client.prisma.case.create({
      data: {
        action: 'timeout',
        guild: guild,
        mod: client.user?.id!,
        user: user,
        created: new Date(),
        updated: new Date(),
        reason: 'Auto-kick for reaching the warn limit.',
        reference: message.id ?? null,
      }
    })

    await client.logs.log({
      guild: guild,
      author: 'Auto kick case',
      color: Colors.tertiary,
      description: description,
      footer: `Case ID: ${caseData.id}`,
      reference: message
    }) as Message

    member.kick()
  }
}