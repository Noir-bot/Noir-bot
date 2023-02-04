import { Case } from '@prisma/client'
import { ButtonInteraction, ChatInputCommandInteraction, Message, ModalSubmitInteraction, time } from 'discord.js'
import Colors from '../../../../constants/Colors'
import DataCase from '../../../../structures/Case'
import NoirClient from '../../../../structures/Client'
import Moderation from '../../../../structures/Moderation'

export default class WarnLogs {
  public static async LogsMessage(client: NoirClient, interaction: ButtonInteraction, caseCache: DataCase, id: string) {
    const moderationData = await Moderation.cache(client, interaction.guildId!)

    if (!moderationData || !moderationData.modLogs || !moderationData.webhook) {
      client.cases.delete(id)
      return
    }

    const webhook = await Moderation.getWebhook(client, moderationData.webhook)

    if (!webhook) return

    const sent = await client.logs.log({
      guild: interaction.guildId!,
      author: 'Warn case',
      color: Colors.secondary,
      description: `**User:** ${interaction.guild?.members.cache.get(caseCache.user)?.user.username} \`${caseCache.user}\`\n` +
        `**Moderator:** ${interaction.guild?.members.cache.get(caseCache.mod)?.user.username} \`${caseCache.mod}\`\n` +
        `**Reason:** ${caseCache.reason}\n` +
        `**Created at:** ${time(caseCache.created, 'd')} ${time(caseCache.created, 'R')}\n` +
        `**Updated at:** ${time(caseCache.updated, 'd')} ${time(caseCache.updated, 'R')}`
    }) as Message

    if (!sent) {
      await DataCase.save(client, caseCache, id)
      return
    }

    caseCache.reference = sent.id
    const data = await DataCase.save(client, caseCache, id)
    const updated = await Moderation.getWebhook(client, moderationData.webhook)

    if (updated) {
      await client.logs.log({
        guild: interaction.guildId!,
        author: 'Warn case',
        color: Colors.secondary,
        description: `**User:** ${interaction.guild?.members.cache.get(caseCache.user)?.user.username} \`${caseCache.user}\`\n` +
          `**Moderator:** ${interaction.guild?.members.cache.get(caseCache.mod)?.user.username} \`${caseCache.mod}\`\n` +
          `**Reason:** ${caseCache.reason}\n` +
          `**Created at:** ${time(caseCache.created, 'd')} ${time(caseCache.created, 'R')}\n` +
          `**Updated at:** ${time(caseCache.updated, 'd')} ${time(caseCache.updated, 'R')}`,
        footer: data ? `Case ID: ${data?.id}` : undefined,
        reference: sent
      })
    }

    client.cases.delete(id)
  }

  public static async UpdateLogs(client: NoirClient, interaction: ModalSubmitInteraction | ButtonInteraction | ChatInputCommandInteraction, caseData: Case, deleted?: boolean) {
    if (!caseData.reference) return

    const moderationData = await Moderation.cache(client, interaction.guildId!)

    if (!moderationData || !moderationData.webhook) return

    const webhook = await Moderation.getWebhook(client, moderationData.webhook)

    if (!webhook) return

    const message = webhook.channel?.messages.cache.get(caseData.reference) ?? await webhook.fetchMessage(caseData.reference).catch(() => null)

    if (!message) return

    client.logs.log({
      guild: interaction.guildId!,
      author: 'Warn case',
      color: deleted ? Colors.warning : Colors.secondary,
      description: `**User:** ${interaction.guild?.members.cache.get(caseData.user)?.user.username} \`${caseData.user}\`\n` +
        `**Moderator:** ${interaction.guild?.members.cache.get(caseData.mod)?.user.username} \`${caseData.mod}\`\n` +
        `**Reason:** ${caseData.reason}\n` +
        `**Created at:** ${time(caseData.created, 'd')} ${time(caseData.created, 'R')}\n` +
        `**Updated at:** ${time(caseData.updated, 'd')} ${time(caseData.updated, 'R')}\n` +
        `${deleted ? `**Removed at:** ${time(new Date(), 'd')} ${time(new Date(), 'R')}` : ''}`,
      footer: `Case ID: ${caseData.id}`,
      reference: message
    })
  }
}