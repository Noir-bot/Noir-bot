import { ActionRowBuilder, ButtonInteraction, MessageActionRowComponentBuilder, ModalMessageModalSubmitInteraction, SelectMenuInteraction } from 'discord.js'
import EmbedConstructor from '../../../../collections/EmbedConstructor'
import Colors from '../../../../constants/Colors'
import NoirClient from '../../../../structures/Client'
import EmbedCommandAuthor from './components/EmbedCommandAuthor'
import EmbedCommandEmbedSettings from './components/EmbedCommandEmbedSettings'
import EmbedCommandFooter from './components/EmbedCommandFooter'
import EmbedCommandMessage from './components/EmbedCommandMessage'
import { EmbedCommandTitle } from './components/EmbedCommandTitle'
import EmbedCommandAddField from './components/fields/EmbedCommandAddField'
import EmbedCommandEditField from './components/fields/EmbedCommandEditField'
import EmbedCommandRemoveField from './components/fields/EmbedCommandRemoveField'
import EmbedCommand from './EmbedCommand'
import EmbedCommandComponents from './EmbedCommandComponents'

export default class EmbedCommandResponses {
  public static async button(client: NoirClient, interaction: ButtonInteraction): Promise<void> {
    const parts = interaction.customId.split('-')
    const type = parts[2]
    const id = parts[1]

    if (type == 'back') await EmbedCommand.initialMessage(client, interaction, id)
    else if (type == 'cancel') await EmbedCommandResponses.cancel(client, interaction, id)
    else if (type == 'reset') await EmbedCommandResponses.reset(client, interaction, id)
    else if (type == 'send') await EmbedCommandResponses.send(client, interaction, id)
    else if (type == 'example') await EmbedCommandResponses.example(client, interaction, id)
    else if (type == 'message') await EmbedCommandMessage.request(client, interaction, id)
    else if (type == 'embed') await EmbedCommandEmbedSettings.request(client, interaction, id)
    else if (type == 'title') await EmbedCommandTitle.request(client, interaction, id)
    else if (type == 'author') await EmbedCommandAuthor.request(client, interaction, id)
    else if (type == 'footer') await EmbedCommandFooter.request(client, interaction, id)
    else if (type == 'fieldAdd') await EmbedCommandAddField.request(client, interaction, id)
    else if (type == 'fieldRemove') await EmbedCommandRemoveField.request(client, interaction, id)
    else if (type == 'fieldEditList') await EmbedCommandEditField.listRequest(client, interaction, id)
  }

  public static async modal(client: NoirClient, interaction: ModalMessageModalSubmitInteraction): Promise<void> {
    const parts = interaction.customId.split('-')
    const type = parts[2]
    const id = parts[1]

    if (type == 'message') await EmbedCommandMessage.response(client, interaction, id)
    else if (type == 'embed') await EmbedCommandEmbedSettings.response(client, interaction, id)
    else if (type == 'title') await EmbedCommandTitle.response(client, interaction, id)
    else if (type == 'author') await EmbedCommandAuthor.response(client, interaction, id)
    else if (type == 'footer') await EmbedCommandFooter.response(client, interaction, id)
    else if (type == 'fieldAdd') await EmbedCommandAddField.response(client, interaction, id)
    else if (type == 'fieldEdit') {
      const oldId = `${parts[parts.length - 1]}`
      await EmbedCommandEditField.response(client, interaction, id, parseInt(oldId))
    }
  }

  public static async selectMenu(client: NoirClient, interaction: SelectMenuInteraction): Promise<void> {
    const parts = interaction.customId.split('-')
    const values = interaction.values
    const type = parts[2]
    const id = parts[1]

    if (type == 'fieldRemove') await EmbedCommandRemoveField.response(client, interaction, id)
    else if (type == 'fieldEditList') await EmbedCommandEditField.request(client, interaction, id, parseInt(values[0]))
  }

  public static async cancel(client: NoirClient, interaction: ButtonInteraction, id: string): Promise<void> {
    client.embedConstructors.delete(id)

    await client.reply.reply({
      interaction: interaction,
      color: Colors.success,
      author: 'Successfully done',
      description: 'Embed builder was successfully canceled'
    })
  }

  public static async reset(client: NoirClient, interaction: ButtonInteraction, id: string): Promise<void> {
    const messageData = new EmbedConstructor(id)

    client.embedConstructors.delete(id)
    client.embedConstructors.set(id, messageData)

    await EmbedCommand.initialMessage(client, interaction, id)
  }

  public static async send(client: NoirClient, interaction: ButtonInteraction, id: string): Promise<void> {
    const messageData = client.embedConstructors.get(id)
    const embedData = messageData?.build(client, interaction).data
    const embedStatus = messageData?.data.embed.status
    const message = messageData?.data.message

    const webhook = await messageData?.webhook(interaction)

    try {
      if (embedStatus && embedData && message) {
        await webhook?.send({ embeds: [embedData], content: message })
      }

      else if (embedStatus && embedData && !message) {
        await webhook?.send({ embeds: [embedData] })
      }

      else if (!embedStatus && message) {
        await webhook?.send({ content: message })
      }

      else {
        const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
          .addComponents(EmbedCommandComponents.backButton(id))

        await client.reply.reply({
          interaction: interaction,
          color: Colors.warning,
          author: 'Message error',
          description: 'Empty message',
          components: [actionRow]
        })

        return
      }

      await EmbedCommand.initialMessage(client, interaction, id)
    } catch {
      return
    }
  }

  public static async example(client: NoirClient, interaction: ButtonInteraction, id: string): Promise<void> {
    const messageData = client.embedConstructors.get(id)
    const embedData = messageData?.build(client, interaction).data
    const embedStatus = messageData?.data.embed.status
    const message = messageData?.data.message

    const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(EmbedCommandComponents.backButton(id))

    try {
      if (embedStatus && embedData && message) {
        await interaction.update({ embeds: [embedData], content: message, components: [actionRow] })
      }

      else if (embedStatus && embedData && !message) {
        await interaction.update({ embeds: [embedData], content: message, components: [actionRow] })
      }

      else if (!embedStatus && message) {
        await interaction.update({ content: message, components: [actionRow] })
      }

      else {
        await client.reply.reply({
          interaction: interaction,
          color: Colors.warning,
          author: 'Message error',
          description: 'Empty message',
          components: [actionRow]
        })
      }
    } catch {
      return
    }
  }
}