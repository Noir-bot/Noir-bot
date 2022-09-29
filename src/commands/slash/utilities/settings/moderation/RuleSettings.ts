import { Duration } from '@sapphire/time-utilities'
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, MessageActionRowComponentBuilder, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, SelectMenuBuilder, SelectMenuInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'
import Colors from '../../../../../constants/Colors'
import NoirClient from '../../../../../structures/Client'
import ModerationCollection, { ModerationRuleRegex, ModerationRuleTypes } from '../collections/ModerationCollection'
import SettingsUtils from '../SettingsUtils'

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
          .setCustomId(SettingsUtils.generateId('settings', id, 'moderationRulesStatus', 'button'))
          .setLabel(`${moderationData?.data.rules.status ? 'Disable' : 'Enable'} moderation rules`)
          .setStyle(SettingsUtils.generateStyle(moderationData?.data.rules.status)),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, 'moderationRulesAdd', 'button'))
          .setLabel('Add rule')
          .setStyle(SettingsUtils.defaultStyle)
      ],
      [
        SettingsUtils.generateBack('settings', id, 'moderationBack.rules'),
        SettingsUtils.generateSave('settings', id, 'moderationSave.rules'),
        SettingsUtils.generateRestore('settings', id, 'moderationRestore.rules')
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
        .setCustomId(SettingsUtils.generateId('settings', id, 'moderationRules', 'select'))
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
        description: 'Setup rules. Choose one of the types, quantity of warnings and the duration of punishment.',
        fields: [
          {
            name: 'What is action type',
            value: 'Action is the punishment to give user for the rule. Types are\n`restriction` Timeout with custom amount of time\n`ban` Ban\n`kick` Kick\n`softban` Ban and unban to clear messages\n`tempban` Temporary ban',
            inline: false
          },
          {
            name: 'How does the duration works',
            value: 'Action duration is the duration of punishment. Duration are optional but some actions require to add it. To make duration permanent type `0` or `permanent`.',
            inline: false
          },
          {
            name: 'How to remove rule',
            value: 'You can always delete rule by changing the quantity to `0`.',
            inline: false
          }
        ],
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
      .setCustomId(SettingsUtils.generateId('settings', id, 'moderationRulesType', 'input'))
      .setLabel('Rule type')
      .setPlaceholder('Choose action to activate. Restriction, kick, ban, tempban, softban')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
    const ruleQuantityInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'moderationRulesQuantity', 'input'))
      .setLabel('Quantity')
      .setPlaceholder('Enter the quantity of warnings to activate the action')
      .setMaxLength(4)
      .setValue(moderationData?.data.logs.rawWebhookAvatar ?? '')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
    const ruleDurationInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'moderationRulesDuration', 'input'))
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
      .setCustomId(SettingsUtils.generateId('settings', id, 'moderationRulesAdd', 'modal'))
      .setTitle('Rule editor')
      .addComponents(actionRows)

    await interaction.showModal(modal)
  }

  public static async addResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string) {
    const moderationData = client.moderationSettings.get(id)
    const ruleType = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'moderationRulesType', 'input')).toLowerCase()
    const ruleQuantity = parseInt(interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'moderationRulesQuantity', 'input')))
    const ruleDuration = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'moderationRulesDuration', 'input')).toLowerCase()
    const duration = new Duration(ruleDuration)

    if (!moderationData) return
    if (!ModerationRuleRegex.test(ruleType)) return
    if (ruleDuration != 'permanent' && parseInt(ruleDuration) != 0 && isNaN(duration.offset)) return
    if (!ruleQuantity || ruleQuantity == 0) return
    if (ruleType == 'restriction' && duration.offset > 1209600000) return
    if (duration.offset > 31556952000) return

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

    console.log(ruleId)

    if (!ruleId && ruleId != 0) return

    const ruleData = moderationData?.data.rules.rules.find(rule => rule.id == ruleId)

    const ruleTypeInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'moderationRulesTypeUpdate', 'input'))
      .setLabel('Rule type')
      .setPlaceholder('Choose action to activate. Restriction, kick, ban, tempban, softban')
      .setValue(`${ruleData?.type}`)
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
    const ruleQuantityInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'moderationRulesQuantityUpdate', 'input'))
      .setLabel('Quantity')
      .setPlaceholder('Enter the quantity of warnings to activate the action')
      .setValue(`${ruleData?.quantity}`)
      .setMaxLength(5)
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
    const ruleDurationInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'moderationRulesDurationUpdate', 'input'))
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
      .setCustomId(SettingsUtils.generateId('settings', id, `moderationRulesEdit.${ruleId}`, 'modal'))
      .setTitle('Rule editor')
      .addComponents(actionRows)

    await interaction.showModal(modal)
  }

  public static async editResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string, ruleId: number) {
    const moderationData = client.moderationSettings.get(id)
    const ruleType = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'moderationRulesTypeUpdate', 'input')).toLowerCase()
    const ruleQuantity = parseInt(interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'moderationRulesQuantityUpdate', 'input')))
    const ruleDuration = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'moderationRulesDurationUpdate', 'input')).toLowerCase()
    const duration = new Duration(ruleDuration)

    if (!moderationData) return
    if (!ModerationRuleRegex.test(ruleType)) return
    if (ruleDuration != 'permanent' && parseInt(ruleDuration) != 0 && isNaN(duration.offset)) return
    if (ruleType == 'restriction' && duration.offset > 1209600000 || duration.offset > 31556952000) return

    if (ruleQuantity == 0) {
      moderationData.data.rules.rules = moderationData.data.rules.rules.filter(rule => rule.id != ruleId)
    }

    else {
      const index = moderationData.data.rules.rules.findIndex(rule => rule.id == ruleId)
      moderationData.data.rules.rules[index] = {
        id: moderationData.data.rules.rules[index].id,
        type: ruleType as ModerationRuleTypes,
        quantity: ruleQuantity,
        duration: ruleDuration.replace(/$0^|$permanent^/, 'permanent') ?? undefined
      }
    }

    await this.initialMessage(client, interaction, id)
  }
}