import { Duration } from '@sapphire/time-utilities'
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, MessageActionRowComponentBuilder, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, SelectMenuBuilder, SelectMenuInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'
import Colors from '../../../../../constants/Colors'
import NoirClient from '../../../../../structures/Client'
import ModerationCollection, { ModerationRuleRegex, ModerationRuleTypes } from '../collections/ModerationCollection'

export default class RuleSettings {
  public static async initialMessage(client: NoirClient, interaction: ButtonInteraction | ModalMessageModalSubmitInteraction | SelectMenuInteraction, id: string) {
    let moderationData = client.moderationSettings.get(id)

    if (!moderationData) {
      client.moderationSettings.set(id, new ModerationCollection(id))
      moderationData = client.moderationSettings.get(id)
      await moderationData?.cacheData(client)
    }

    const buttons = [
      [
        new ButtonBuilder()
          .setCustomId(client.componentsUtils.generateId('settings', id, 'moderationRulesStatus', 'button'))
          .setLabel(`${moderationData?.data.rules.status ? 'Disable' : 'Enable'} moderation rules`)
          .setStyle(client.componentsUtils.generateStyle(moderationData?.data.rules.status)),
        new ButtonBuilder()
          .setCustomId(client.componentsUtils.generateId('settings', id, 'moderationRulesAdd', 'button'))
          .setLabel('Add rule')
          .setStyle(client.componentsUtils.defaultStyle)
      ],
      [
        client.componentsUtils.generateBack('settings', id, 'moderationBack.rules'),
        client.componentsUtils.generateSave('settings', id, 'moderationSave.rules'),
        client.componentsUtils.generateRestore('settings', id, 'moderationRestore.rules')
      ]
    ]

    if (!moderationData?.data.rules.status) buttons[0][1].setDisabled(true)
    else if (interaction.guildId && client.utils.premiumStatus(interaction.guildId) && moderationData?.data.rules && moderationData.data.rules.rules.length >= 30) buttons[0][1].setDisabled(true)
    else if (interaction.guildId && !client.utils.premiumStatus(interaction.guildId) && moderationData?.data.rules && moderationData.data.rules.rules.length >= 5) buttons[0][1].setDisabled(true)
    else buttons[0][1].setDisabled(false)

    const actionRows = [
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[0]),
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[1])
    ]

    if (moderationData?.data.rules.rules && moderationData.data.rules.rules.length >= 1) {
      const selectMenu = new SelectMenuBuilder()
        .setCustomId(client.componentsUtils.generateId('settings', id, 'moderationRules', 'select'))
        .setPlaceholder(`Select rule to edit`)
        .setMaxValues(1)
        .setMinValues(1)
        .setDisabled(moderationData?.data.rules.rules.length == 0)
        .addOptions(
          moderationData?.data.rules.rules.map(rule => {
            return {
              label: `#${rule.id + 1} ${client.utils.capitalize(rule.type)}`,
              description: `${client.utils.capitalize(rule.type)} user after ${rule.quantity} warnings`,
              value: `${rule.id}`
            }
          })
        )

      actionRows.unshift(new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(selectMenu))
    }

    try {
      await client.reply.reply({
        interaction: interaction,
        author: 'Setup rules',
        description: 'Setup auto-moderation rules. Punish rulebreakers automatically by given rules.',
        color: Colors.primary,
        components: actionRows
      })
    } catch {
      return
    }
  }

  public static async addRequest(client: NoirClient, interaction: ButtonInteraction, id: string) {
    const moderationData = client.moderationSettings.get(id)

    const ruleTypeInput = new TextInputBuilder()
      .setCustomId(client.componentsUtils.generateId('settings', id, 'moderationRulesType', 'input'))
      .setLabel('Rule type')
      .setPlaceholder('Choose action to activate. Restriction, kick, ban, tempban, softban')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
    const ruleQuantityInput = new TextInputBuilder()
      .setCustomId(client.componentsUtils.generateId('settings', id, 'moderationRulesQuantity', 'input'))
      .setLabel('Quantity')
      .setPlaceholder('Enter the quantity of warnings to activate the action')
      .setMaxLength(4)
      .setValue(moderationData?.data.logs.rawWebhookAvatar ?? '')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
    const ruleDurationInput = new TextInputBuilder()
      .setCustomId(client.componentsUtils.generateId('settings', id, 'moderationRulesDuration', 'input'))
      .setLabel('Action duration')
      .setPlaceholder('Enter the action duration. Use this format 1h10m (1 hour 10 minutes)')
      .setValue(moderationData?.data.logs.rawWebhookAvatar ?? '')
      .setStyle(TextInputStyle.Short)
      .setRequired(false)

    const actionRows = [
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(ruleTypeInput),
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(ruleQuantityInput),
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(ruleDurationInput)
    ]

    const modal = new ModalBuilder()
      .setCustomId(client.componentsUtils.generateId('settings', id, 'moderationRulesAdd', 'modal'))
      .setTitle('Rule editor')
      .addComponents(actionRows)

    await interaction.showModal(modal)
  }

  public static async addResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string) {
    const moderationData = client.moderationSettings.get(id)
    const ruleType = interaction.fields.getTextInputValue(client.componentsUtils.generateId('settings', id, 'moderationRulesType', 'input')).toLowerCase()
    const ruleQuantity = parseInt(interaction.fields.getTextInputValue(client.componentsUtils.generateId('settings', id, 'moderationRulesQuantity', 'input')))
    const ruleDuration = interaction.fields.getTextInputValue(client.componentsUtils.generateId('settings', id, 'moderationRulesDuration', 'input'))
    const duration = new Duration(ruleDuration)

    if (!moderationData) return
    if (!ModerationRuleRegex.test(ruleType)) return
    if (isNaN(duration.offset)) return
    if (!ruleQuantity || ruleQuantity == 0) return

    moderationData.data.rules.rules.push({
      id: moderationData.data.rules.rules.length,
      type: ruleType as ModerationRuleTypes,
      quantity: ruleQuantity,
      duration: ruleDuration
    })

    await this.initialMessage(client, interaction, id)
  }

  public static async editRequest(client: NoirClient, interaction: SelectMenuInteraction, id: string) {
    const moderationData = client.moderationSettings.get(id)
    const ruleId = parseInt(interaction.values[0])

    if (!ruleId) return

    const ruleData = moderationData?.data.rules.rules.find(rule => rule.id == ruleId)

    const ruleTypeInput = new TextInputBuilder()
      .setCustomId(client.componentsUtils.generateId('settings', id, 'moderationRulesTypeUpdate', 'input'))
      .setLabel('Rule type')
      .setPlaceholder('Choose action to activate. Restriction, kick, ban, tempban, softban')
      .setValue(`${ruleData?.type}`)
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
    const ruleQuantityInput = new TextInputBuilder()
      .setCustomId(client.componentsUtils.generateId('settings', id, 'moderationRulesQuantityUpdate', 'input'))
      .setLabel('Quantity')
      .setPlaceholder('Enter the quantity of warnings to activate the action')
      .setValue(`${ruleData?.quantity}`)
      .setMaxLength(5)
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
    const ruleDurationInput = new TextInputBuilder()
      .setCustomId(client.componentsUtils.generateId('settings', id, 'moderationRulesDurationUpdate', 'input'))
      .setLabel('Action duration')
      .setPlaceholder('Enter the action duration. Use this format 1h10m (1 hour 10 minutes)')
      .setValue(`${ruleData?.duration}`)
      .setStyle(TextInputStyle.Short)
      .setRequired(false)

    const actionRows = [
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(ruleTypeInput),
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(ruleQuantityInput),
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(ruleDurationInput)
    ]

    const modal = new ModalBuilder()
      .setCustomId(client.componentsUtils.generateId('settings', id, `moderationRulesEdit.${ruleId - 1}`, 'modal'))
      .setTitle('Rule editor')
      .addComponents(actionRows)

    await interaction.showModal(modal)
  }

  public static async editResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string, ruleId: number) {
    const moderationData = client.moderationSettings.get(id)
    const ruleType = interaction.fields.getTextInputValue(client.componentsUtils.generateId('settings', id, 'moderationRulesTypeUpdate', 'input')).toLowerCase()
    const ruleQuantity = parseInt(interaction.fields.getTextInputValue(client.componentsUtils.generateId('settings', id, 'moderationRulesQuantityUpdate', 'input')))
    const ruleDuration = interaction.fields.getTextInputValue(client.componentsUtils.generateId('settings', id, 'moderationRulesDurationUpdate', 'input'))
    const duration = new Duration(ruleDuration)

    if (!moderationData) return
    if (!ModerationRuleRegex.test(ruleType)) return
    if (isNaN(duration.offset)) return

    if (ruleQuantity == 0) {
      moderationData.data.rules.rules = moderationData.data.rules.rules.filter(rule => rule.id != ruleId)
    }

    else {
      const index = moderationData.data.rules.rules.findIndex(rule => rule.id == ruleId)
      moderationData.data.rules.rules[index] = {
        id: moderationData.data.rules.rules[index].id,
        type: ruleType as ModerationRuleTypes,
        quantity: ruleQuantity,
        duration: ruleDuration ?? undefined
      }
    }

    await this.initialMessage(client, interaction, id)
  }
}