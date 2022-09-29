import { ActionRowBuilder, ButtonInteraction, MessageActionRowComponentBuilder, SelectMenuBuilder, SelectMenuInteraction } from 'discord.js'
import Colors from '../../../../../../../constants/Colors'
import { WelcomeMessageType } from '../../../../../../../constants/Options'
import NoirClient from '../../../../../../../structures/Client'
import SettingsUtils from '../../../SettingsUtils'
import WelcomeEditor from '../WelcomeEditor'

export default class WelcomeEditorRemoveField {
  public static async request(client: NoirClient, interaction: ButtonInteraction | SelectMenuInteraction, id: string, type: WelcomeMessageType) {
    const { messageData } = await WelcomeEditor.getMessageType(client, id, type)

    if (!messageData) return

    const buttons = [
      SettingsUtils.generateBack('settings', id, `welcomeBack.welcomeEditor.${type}`)
    ]

    const selectMenu = new SelectMenuBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, `welcomeEditorRemoveField.${type}`, 'select'))
      .setPlaceholder('Choose fields to remove')
      .setMaxValues(messageData.embed.fields.length)
      .setMinValues(1)
      .addOptions(messageData.embed.fields.map(field => {
        return {
          label: field.name,
          description: 'Select to remove',
          value: `${field.id}`
        }
      }))

    const selectMenuActionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(selectMenu)

    const buttonActionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(buttons)

    try {
      await client.reply.reply({
        interaction: interaction,
        author: 'Embed field editor',
        description: 'Select fields to remove',
        color: Colors.primary,
        components: [selectMenuActionRow, buttonActionRow]
      })
    } catch {
      return
    }
  }

  public static async response(client: NoirClient, interaction: SelectMenuInteraction, id: string, type: WelcomeMessageType) {
    const { messageData } = await WelcomeEditor.getMessageType(client, id, type)

    if (!messageData) return

    const ids = interaction.values

    ids.forEach(id => {
      messageData.embed.fields = messageData.embed.fields.filter(field => field.id != parseInt(id))
    })

    if (messageData.embed.fields.length >= 1) {
      await this.request(client, interaction, id, type)
    }

    else {
      await WelcomeEditor.initialMessage(client, interaction, id, type)
    }
  }
}