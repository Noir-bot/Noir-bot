import { ActionRowBuilder, ButtonInteraction, MessageActionRowComponentBuilder, SelectMenuBuilder, SelectMenuInteraction } from 'discord.js'
import Colors from '../../../../../../constants/Colors'
import NoirClient from '../../../../../../structures/Client'
import EmbedCommand from '../../EmbedCommand'
import EmbedCommandComponents from '../../EmbedCommandComponents'
import EmbedCommandUtils from '../../EmbedCommandUtils'

export default class EmbedCommandRemoveField {
  public static async request(client: NoirClient, interaction: ButtonInteraction, id: string): Promise<void> {
    const messageData = client.embeds.get(id)

    if (!messageData?.data.embed.fields?.size) return

    const selectMenu = new SelectMenuBuilder()
      .setCustomId(EmbedCommandUtils.generateComponentId(id, 'fieldRemove', 'select'))
      .setPlaceholder('Choose field(s) to remove')
      .setMaxValues(messageData.data.embed.fields.size)
      .setMinValues(1)
      .addOptions(messageData.data.embed.fields.map(field => {
        return {
          label: field.name,
          description: 'Select to remove',
          value: `${field.id}`
        }
      }))

    const selectMenuActionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(selectMenu)

    const buttonActionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(EmbedCommandComponents.backButton(id))

    try {
      await client.reply.reply({
        interaction: interaction,
        author: 'Embed field editor',
        description: 'Select field(s) to remove',
        color: Colors.primary,
        components: [selectMenuActionRow, buttonActionRow]
      })
    } catch {
      return
    }
  }

  public static async response(client: NoirClient, interaction: SelectMenuInteraction, id: string): Promise<void> {
    const fields = interaction.values

    fields.map(field => {
      client.embeds.get(id)?.removeEmbedField(parseInt(field))
    })

    await EmbedCommand.initialMessage(client, interaction, id)
  }
}