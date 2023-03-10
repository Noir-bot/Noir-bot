import WarnRule from '@commands/slash/moderation/warn/Rule'
import Colors from '@constants/Colors'
import Logs from '@helpers/Logs'
import { Case } from '@prisma/client'
import DataCase from '@structures/Case'
import Client from '@structures/Client'
import Moderation from '@structures/moderation/Moderation'
import { ButtonInteraction, ChatInputCommandInteraction, Message, ModalSubmitInteraction, time } from 'discord.js'


export default class WarnLogs {
  public static async LogsMessage(client: Client, interaction: ButtonInteraction, caseCache: DataCase, id: string) {
    const sent = await Logs.log({
      client,
      guild: interaction.guildId!,
      author: 'Warn case',
      color: Colors.logsCase,
      description: `**User:** ${interaction.guild?.members.cache.get(caseCache.user)?.user.username} \`${caseCache.user}\`\n` +
        `**Moderator:** ${interaction.guild?.members.cache.get(caseCache.moderator)?.user.username} \`${caseCache.moderator}\`\n` +
        `**Reason:** ${caseCache.reason}\n` +
        `**Created at:** ${time(caseCache.created, 'd')} ${time(caseCache.created, 'R')}\n` +
        `**Updated at:** ${time(caseCache.updated, 'd')} ${time(caseCache.updated, 'R')}`
    }) as Message

    if (sent) {
      caseCache.reference = sent.id
      const data = await DataCase.save(client, caseCache, id)

      await Logs.log({
        client,
        guild: interaction.guildId!,
        author: 'Warn case',
        color: Colors.logsCase,
        description: `**User:** ${interaction.guild?.members.cache.get(caseCache.user)?.user.username} \`${caseCache.user}\`\n` +
          `**Moderator:** ${interaction.guild?.members.cache.get(caseCache.moderator)?.user.username} \`${caseCache.moderator}\`\n` +
          `**Reason:** ${caseCache.reason}\n` +
          `**Created at:** ${time(caseCache.created, 'd')} ${time(caseCache.created, 'R')}\n` +
          `**Updated at:** ${time(caseCache.updated, 'd')} ${time(caseCache.updated, 'R')}`,
        footer: data ? `Case ID: ${data?.id}` : undefined,
        reference: sent
      })
    }

    else {
      DataCase.save(client, caseCache, id)
    }

    WarnRule.check(client, interaction.guildId!, caseCache.user)
    client.moderationCases.delete(id)
  }

  public static async UpdateLogs(client: Client, interaction: ModalSubmitInteraction | ButtonInteraction | ChatInputCommandInteraction, caseData: Case, deleted?: boolean) {
    if (!caseData.reference) return

    const moderationData = await Moderation.cache(client, interaction.guildId!)

    if (!moderationData || !moderationData.webhook) return

    const webhook = await Moderation.getWebhook(client, moderationData.webhook)

    if (!webhook) return

    const message = webhook.channel?.messages.cache.get(caseData.reference) ?? await webhook.fetchMessage(caseData.reference).catch(() => null)

    if (!message) return

    Logs.log({
      client,
      guild: interaction.guildId!,
      author: 'Warn case',
      color: deleted ? Colors.warning : Colors.logsCase,
      description: `**User:** ${interaction.guild?.members.cache.get(caseData.user)?.user.username} \`${caseData.user}\`\n` +
        `**Moderator:** ${interaction.guild?.members.cache.get(caseData.moderator)?.user.username} \`${caseData.moderator}\`\n` +
        `**Reason:** ${caseData.reason}\n` +
        `**Created at:** ${time(caseData.created, 'd')} ${time(caseData.created, 'R')}\n` +
        `**Updated at:** ${time(caseData.updated, 'd')} ${time(caseData.updated, 'R')}\n` +
        `${caseData.expires ? `**Expire${caseData.expires.getTime() <= new Date().getTime() ? 'd' : 's'} at:** ${time(caseData.expires.getTime(), 'd')} ${time(caseData.expires.getTime(), 'R')}\n` : ''}` +
        `${deleted ? `**Removed at:** ${time(new Date(), 'd')} ${time(new Date(), 'R')}` : ''}`,
      footer: `Case ID: ${caseData.id}`,
      reference: message
    })
  }
}