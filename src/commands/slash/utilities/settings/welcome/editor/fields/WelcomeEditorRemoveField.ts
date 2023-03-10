import SettingsUtils from '@commands/slash/utilities/settings/SettingsUtils'
import WelcomeEditor from '@commands/slash/utilities/settings/welcome/editor/WelcomeEditor'
import Colors from '@constants/Colors'
import Reply from '@helpers/Reply'
import Client from '@structures/Client'
import Save from '@structures/Save'
import WelcomeMessage, { WelcomeMessageType } from '@structures/welcome/WelcomeMessage'
import { ActionRowBuilder, ButtonInteraction, MessageActionRowComponentBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction } from 'discord.js'

export default class WelcomeEditorRemoveField {
  public static async request(client: Client, interaction: ButtonInteraction<'cached'> | StringSelectMenuInteraction<'cached'>, id: string, type: WelcomeMessageType) {
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
      await Reply.reply({
        client,
        interaction: interaction,
        author: 'Embed field editor',
        description: 'Select fields to remove',
        color: Colors.primary,
        components: [selectMenuActionRow, buttonActionRow]
      })
    } catch (err) {
      return console.log(err)
    }
  }

  public static async response(client: Client, interaction: StringSelectMenuInteraction<'cached'>, id: string, type: WelcomeMessageType) {
    const messageData = await WelcomeMessage.cache(client, id, type)
    const save = Save.cache(client, `${interaction.guildId}-welcome`)
    const ids = interaction.values

    ids.forEach(id => {
      const index = parseInt(id)

      messageData.fieldsId = messageData.fieldsId.splice(index, index)
      messageData.fieldsInline = messageData.fieldsInline.splice(index, index)
      messageData.fieldsName = messageData.fieldsName.splice(index, index)
      messageData.fieldsValue = messageData.fieldsValue.splice(index, index)
      save.count += 1
    })

    if (messageData.fieldsId.length >= 1) {
      await this.request(client, interaction, id, type)
    }

    else {
      await WelcomeEditor.initialMessage(client, interaction, id, type)
    }
  }
}