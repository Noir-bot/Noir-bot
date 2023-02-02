import { ButtonInteraction, EmbedBuilder, time } from 'discord.js'
import Colors from '../../../../constants/Colors'
import Case from '../../../../structures/Case'
import NoirClient from '../../../../structures/Client'
import Moderation from '../../../../structures/Moderation'

export default class WarnLogs {
  public static async LogsMessage(client: NoirClient, interaction: ButtonInteraction, caseCache: Case, id: string) {
    const moderationData = await Moderation.cache(client, interaction.guildId!)

    if (!moderationData || !moderationData.modLogs || !moderationData.webhook) {
      client.cases.delete(id)
      return
    }

    const webhook = await Moderation.getWebhook(client, moderationData.webhook)

    if (!webhook) return

    console.log(caseCache.created.getTime())

    const embed = new EmbedBuilder()
      .setAuthor({ name: 'Warn case' })
      .setColor(Colors.secondary)
      .setDescription(
        `**User:** ${interaction.guild?.members.cache.get(caseCache.user)?.user.username} \`${caseCache.user}\`\n` +
        `**Moderator:** ${interaction.guild?.members.cache.get(caseCache.mod)?.user.username} \`${caseCache.mod}\`\n` +
        `**Reason:** ${caseCache.reason}\n` +
        `**Created at:** ${time(caseCache.created, 'd')} ${time(caseCache.created, 'R')}\n` +
        `**Updated at:** ${time(caseCache.updated, 'd')} ${time(caseCache.updated, 'R')}`
      )

    const sent = await webhook.send({ embeds: [embed] }).catch(() => null)

    if (!sent) {
      await Case.save(client, caseCache, id)
      return
    }

    caseCache.reference = sent.id
    const data = await Case.save(client, caseCache, id)

    if (data) {
      embed.setFooter({ text: `Case ID: ${data?.id}` })
    }

    const updated = await Moderation.getWebhook(client, moderationData.webhook)

    if (updated) {
      updated.editMessage(sent, { embeds: [embed] })
    }

    client.cases.delete(id)
  }
}