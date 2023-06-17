import Options from '@constants/Options'
import Client from '@structures/Client'
import Event from '@structures/Event'
import Command from '@structures/commands/Command'
import chalk from 'chalk'
import { ActivityType } from 'discord.js'
import glob from 'glob'
import { promisify } from 'util'

export default class ReadyEvent extends Event {
  constructor(client: Client) {
    super(client, 'ready', true)
  }

  public async execute(client: Client) {
    console.info(chalk.cyan.bold('[✨] Noir Ready!'))

    client?.user?.setActivity({
      name: `for ${client.guilds.cache.size} servers`,
      type: ActivityType.Watching
    })

    await this.loadCommands(client, `${__dirname}/../../commands/**/**/*{.js,.ts}`)
  }

  private async loadCommands(client: Client, path: string) {
    const globPromise = promisify(glob)
    const commandsFiles = await globPromise(path)

    commandsFiles.forEach(async (commandFile: string) => {
      try {
        const file = await import(commandFile)
        const command = new file.default(client) as Command

        if (!command.execute) return

        if (command.options.development && client.user?.id == Options.clientId) {
          return
        }

        if (command.options.type == 'private') {
          client.guilds.cache.get(Options.guildId)?.commands.create(command.data).then((cmd) => {
            if (command) {
              client.commandsId.set(command.data.name, cmd.id)
            }
          })
        }

        else if (command.options.type == 'public') {
          client.application?.commands.create(command.data).then((cmd) => {
            if (command) {
              client.commandsId.set(command.data.name, cmd.id)
            }
          })
        }

        client.commands.set(command.data.name, command)
      } catch (error) {
        console.log(error)
      }
    })
  }

  // private async loadCases(client: Client) {
  //   const cases = await client.prisma.case.findMany({
  //     where: {
  //       expires: {
  //         gt: new Date()
  //       },
  //       action: {
  //         in: ['tempban']
  //       },
  //       resolved: false
  //     }
  //   })

  //   if (!cases) return

  //   cases.forEach(async (caseData) => {
  //     if (caseData.expires && caseData.duration) {
  //       client.moderationCases.set(`${caseData.id}`, {
  //         guild: caseData.guild,
  //         user: caseData.user,
  //         moderator: caseData.moderator,
  //         action: caseData.action as CaseAction,
  //         duration: caseData.duration,
  //         created: caseData.created,
  //         expires: caseData.expires,
  //         reason: caseData.reason ?? undefined,
  //         updated: caseData.updated ?? undefined,
  //         reference: caseData.reference ?? undefined,
  //         resolved: caseData.resolved,
  //         id: caseData.id.toString()
  //       })

  //       client.periodicCases.set(caseData.id, caseData.expires)
  //     }
  //   })
  // }

  // private handleCases(client: Client) {
  //   cron.schedule('5 * * * *', async () => {
  //     const expiredCases = client.moderationCases.filter((data) => {
  //       if (data.expires) {
  //         data.expires < new Date() && !data.resolved
  //       }
  //     })

  //     if (!expiredCases) return

  //     const guilds = expiredCases.map((data) => data.guild)

  //     guilds.forEach(async guild => {
  //       const moderationData = await Moderation.cache(client, guild)
  //       const guildData = client.guilds.cache.get(guild)
  //       const cases = expiredCases.filter((data) => data.guild == guild)

  //       cases.forEach(async (data) => {
  //         if (data.action == 'tempban') {
  //           guildData?.members.unban(data.user, 'Case Expired')

  //           if (data.id) {
  //             await client.prisma.case.update({
  //               where: {
  //                 id: parseInt(data.id)
  //               },
  //               data: {
  //                 resolved: true
  //               }
  //             })
  //           }

  //           if (moderationData.logs) {
  //             if (!data.reference) return

  //             Logs.log({
  //               client,
  //               guild,
  //               referenceId: data.reference,
  //               color: Colors.logsCase,
  //               author: 'Unban case',
  //               description: `${Emojis.rulebrekaer} User: ${guildData?.members.cache.get(data.user)?.user.username} \`${data.user}\`\n` +
  //                 `${Emojis.uncheck} Moderator: ${guildData?.members.cache.get(data.moderator)?.user.username} \`${data.moderator}\`\n` +
  //                 `${Emojis.document} Reason: ${data.reason}\n` +
  //                 `${Emojis.time} Created at: ${time(data.created, 'd')} ${time(data.created, 'R')}\n` +
  //                 `${Emojis.time} Updated at: ${time(data.updated, 'd')} ${time(data.updated, 'R')}\n` +
  //                 `${Emojis.time} Expired at: ${time(data.expires!, 'd')} ${time(data.expires!, 'R')}\n`,
  //               footer: data ? `Case ID: ${data?.id}` : undefined,
  //             })
  //           }
  //         }
  //       })
  //     })
  //   })
  // }
}