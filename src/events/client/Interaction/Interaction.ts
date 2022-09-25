import { Interaction, InteractionType, ModalMessageModalSubmitInteraction } from 'discord.js'
import Premium from '../../../collections/Premium'
import NoirClient from '../../../structures/Client'
import Event from '../../../structures/Event'
import ButtonExecution from './ButtonExecution'
import CommandExecution from './CommandExecution'
import ModalExecution from './ModalExecution'
import SelectMenuExecution from './SelectMenuExecution'

export default class InteractionEvent extends Event {
  constructor(client: NoirClient) {
    super(client, 'interactionCreate', false)
  }

  public async execute(client: NoirClient, interaction: Interaction): Promise<void> {
    await this.premiumCache(client, interaction)

    if (interaction.isButton()) await ButtonExecution.button(client, interaction)
    else if (interaction.isSelectMenu()) await SelectMenuExecution.selectMenu(client, interaction)
    else if (interaction.type == InteractionType.ApplicationCommand || interaction.isChatInputCommand() || interaction.isContextMenuCommand()) await CommandExecution.command(client, interaction)
    else if (interaction.type == InteractionType.ModalSubmit) await ModalExecution.messageModal(client, interaction as ModalMessageModalSubmitInteraction)
  }

  private async premiumCache(client: NoirClient, interaction: Interaction): Promise<void> {
    if (!interaction.guild) return

    let premiumData = client.premium.get(interaction.guild.id)

    if (!premiumData) {
      let premiumDataRequest = await client.prisma.premium.findFirst({ where: { guild: interaction.guild.id } })

      if (!premiumDataRequest) {
        premiumDataRequest = await client.prisma.premium.create({
          data: {
            guild: interaction.guild.id,
            expireAt: new Date(),
            status: false
          }
        })
      }

      premiumData = new Premium(premiumDataRequest?.expireAt ?? new Date(), premiumDataRequest?.status ?? false)
      client.premium.set(interaction.guild.id, premiumData)
    }

    if (premiumData.expired() && premiumData.status) {
      await client.prisma.premium.updateMany({
        where: { guild: interaction.guild.id },
        data: { status: false }
      })

      premiumData.status = false
    }
  }
}