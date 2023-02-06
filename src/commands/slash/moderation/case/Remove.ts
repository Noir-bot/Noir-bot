import { ChatInputCommandInteraction } from 'discord.js'
import Colors from '../../../../constants/Colors'
import NoirClient from '../../../../structures/Client'
import WarnLogs from '../warn/Logs'

export default class CaseRemove {
  public static async remove(client: NoirClient, interaction: ChatInputCommandInteraction, id: number) {
    const caseData = await client.prisma.case.delete({ where: { id: id } }).catch(() => null)

    if (!caseData) {
      client.reply.reply({
        interaction: interaction,
        color: Colors.warning,
        author: 'Case error',
        description: 'This case does not exist.',
        ephemeral: true
      })

      return
    }

    client.reply.reply({
      interaction: interaction,
      color: Colors.primary,
      author: 'Case removed',
      description: 'Case was successfully removed.',
      ephemeral: true
    })

    WarnLogs.UpdateLogs(client, interaction, caseData, true)
  }
}