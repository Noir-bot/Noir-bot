import ButtonExecution from '@events/client/interaction/ButtonExecution'
import CommandExecution from '@events/client/interaction/CommandExecution'
import ModalExecution from '@events/client/interaction/ModalExecution'
import SelectMenuExecution from '@events/client/interaction/SelectMenuExecution'
import Client from '@structures/Client'
import Event from '@structures/Event'
import Premium from '@structures/Premium'
import { Interaction, ModalMessageModalSubmitInteraction } from 'discord.js'

export default class InteractionEvent extends Event {
  constructor(client: Client) {
    super(client, 'interactionCreate', false)
  }

  public async execute(client: Client, interaction: Interaction) {
    if (interaction.guild) {
      await Premium.cache(client, interaction.guild.id)
    }

    if (interaction.isButton()) await ButtonExecution.button(client, interaction)
    else if (interaction.isAnySelectMenu()) await SelectMenuExecution.selectMenu(client, interaction)
    else if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) await CommandExecution.command(client, interaction)
    else if (interaction.isModalSubmit()) await ModalExecution.messageModal(client, interaction as ModalMessageModalSubmitInteraction)
  }
}
