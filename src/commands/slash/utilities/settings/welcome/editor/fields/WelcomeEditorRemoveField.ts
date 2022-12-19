import { ActionRowBuilder, ButtonInteraction, MessageActionRowComponentBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction } from 'discord.js'
import Colors from '../../../../../../../constants/Colors'
import NoirClient from '../../../../../../../structures/Client'
import WelcomeMessage, { WelcomeMessageType } from '../../../../../../../structures/WelcomeMessage'
import SettingsUtils from '../../../SettingsUtils'
import WelcomeEditor from '../WelcomeEditor'

export default class WelcomeEditorRemoveField {
  public static async request(client: NoirClient, interaction: ButtonInteraction<'cached'> | StringSelectMenuInteraction<'cached'>, id: string, type: WelcomeMessageType) {
    const messageData = await WelcomeMessage.cache(client, id, type)

    if (!messageData) return

    const buttons = [
      SettingsUtils.generateBack('settings', id, `welcomeBack.welcomeEditor.${type}`)
    ]

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, `welcomeEditorRemoveField.${type}`, 'select'))
      .setPlaceholder('Choose fields to remove')
      .setMaxValues(messageData.fieldsId.length)
      .setMinValues(1)
      .addOptions(messageData.fieldsId.map(id => {
        return {
          label: messageData.fieldsName[id],
          description: 'Select to remove',
          value: `${id}`
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

  public static async response(client: NoirClient, interaction: StringSelectMenuInteraction<'cached'>, id: string, type: WelcomeMessageType) {
    const messageData = await WelcomeMessage.cache(client, id, type)
    const ids = interaction.values

    ids.forEach(id => {
      const index = parseInt(id)

      messageData.fieldsId = messageData.fieldsId.splice(index, index)
      messageData.fieldsInline = messageData.fieldsInline.splice(index, index)
      messageData.fieldsName = messageData.fieldsName.splice(index, index)
      messageData.fieldsValue = messageData.fieldsValue.splice(index, index)
    })

    if (messageData.fieldsId.length >= 1) {
      await this.request(client, interaction, id, type)
    }

    else {
      await WelcomeEditor.initialMessage(client, interaction, id, type)
    }
  }
}