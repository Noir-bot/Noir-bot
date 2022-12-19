import { Interaction, ModalMessageModalSubmitInteraction } from 'discord.js'
import NoirClient from '../../../structures/Client'
import Event from '../../../structures/Event'
import Premium from '../../../structures/Premium'
import ButtonExecution from './ButtonExecution'
import CommandExecution from './CommandExecution'
import ModalExecution from './ModalExecution'
import SelectMenuExecution from './SelectMenuExecution'

export default class InteractionEvent extends Event {
  constructor(client: NoirClient) {
    super(client, 'interactionCreate', false)
  }

  public async execute(client: NoirClient, interaction: Interaction) {
    if (interaction.guild) {
      await Premium.cache(client, interaction.guild.id)
    }

    if (interaction.isButton()) await ButtonExecution.button(client, interaction)
    else if (interaction.isAnySelectMenu()) await SelectMenuExecution.selectMenu(client, interaction)
    else if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) await CommandExecution.command(client, interaction)
    else if (interaction.isModalSubmit()) await ModalExecution.messageModal(client, interaction as ModalMessageModalSubmitInteraction)
  }
}