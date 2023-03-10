import WarnLogs from '@commands/slash/moderation/warn/Logs'
import Colors from '@constants/Colors'
import Reply from '@helpers/Reply'
import Client from '@structures/Client'
import { ChatInputCommandInteraction } from 'discord.js'

export default class CaseRemove {
  public static async remove(client: Client, interaction: ChatInputCommandInteraction, id: number) {
    const caseData = await client.prisma.case.delete({ where: { id: id } }).catch(() => null)

    if (!caseData) {
      Reply.reply({
        client,
        interaction: interaction,
        color: Colors.warning,
        author: 'Case error',
        description: 'This case does not exist.',
        ephemeral: true
      })

      return
    }

    Reply.reply({
      client,
      interaction: interaction,
      color: Colors.primary,
      author: 'Case removed',
      description: 'Case was successfully removed.',
      ephemeral: true
    })

    WarnLogs.UpdateLogs(client, interaction, caseData, true)
  }
}