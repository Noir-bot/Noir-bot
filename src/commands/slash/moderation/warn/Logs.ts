import Colors from '@constants/Colors'
import Emojis from '@constants/Emojis'
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
      description: `${Emojis.rulebrekaer} User: ${interaction.guild?.members.cache.get(caseCache.user)?.user.username} \`${caseCache.user}\`\n` +
        `${Emojis.user} Moderator: ${interaction.guild?.members.cache.get(caseCache.moderator)?.user.username} \`${caseCache.moderator}\`\n` +
        `${Emojis.document} Reason: ${caseCache.reason}\n` +
        `${Emojis.time} Created at: ${time(caseCache.created, 'd')} ${time(caseCache.created, 'R')}\n` +
        `${Emojis.time} Updated at: ${time(caseCache.updated, 'd')} ${time(caseCache.updated, 'R')}`
    }) as Message

    if (sent) {
      caseCache.reference = sent.id
      const data = await DataCase.save(client, caseCache, id)

      await Logs.log({
        client,
        guild: interaction.guildId!,
        author: 'Warn case',
        color: Colors.logsCase,
        description: `${Emojis.rulebrekaer} User: ${interaction.guild?.members.cache.get(caseCache.user)?.user.username} \`${caseCache.user}\`\n` +
          `${Emojis.uncheck} Moderator: ${interaction.guild?.members.cache.get(caseCache.moderator)?.user.username} \`${caseCache.moderator}\`\n` +
          `${Emojis.document} Reason: ${caseCache.reason}\n` +
          `${Emojis.time} Created at: ${time(caseCache.created, 'd')} ${time(caseCache.created, 'R')}\n` +
          `${Emojis.time} Updated at: ${time(caseCache.updated, 'd')} ${time(caseCache.updated, 'R')}`,
        footer: data ? `Case ID: ${data?.id}` : undefined,
        reference: sent
      })
    }

    else {
      await DataCase.save(client, caseCache, id)
    }

    client.moderationCases.delete(id)
  }

  public static async UpdateLogs(client: Client, interaction: ModalSubmitInteraction | ButtonInteraction | ChatInputCommandInteraction, caseData: Case, deleted?: boolean) {
    if (!caseData.reference) return

    const moderationData = await Moderation.cache(client, interaction.guildId!, false, true)

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
      description: `${Emojis.rulebrekaer} User: ${interaction.guild?.members.cache.get(caseData.user)?.user.username} \`${caseData.user}\`\n` +
        `${Emojis.user} Moderator: ${interaction.guild?.members.cache.get(caseData.moderator)?.user.username} \`${caseData.moderator}\`\n` +
        `${Emojis.document} Reason: ${caseData.reason}\n` +
        `${Emojis.time} Created at: ${time(caseData.created, 'd')} ${time(caseData.created, 'R')}\n` +
        `${Emojis.time} Updated at: ${time(caseData.updated, 'd')} ${time(caseData.updated, 'R')}\n` +
        `${caseData.expires ? `${Emojis.time} Expire${caseData.expires.getTime() <= new Date().getTime() ? 'd' : 's'} at: ${time(caseData.expires.getTime(), 'd')} ${time(caseData.expires.getTime(), 'R')}\n` : ''}` +
        `${deleted ? `${Emojis.trash} Removed at: ${time(new Date(), 'd')} ${time(new Date(), 'R')}` : ''}`,
      footer: `Case ID: ${caseData.id}`,
      reference: message
    })
  }
}