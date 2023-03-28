import SettingsUtils from '@commands/slash/utilities/settings/SettingsUtils'
import Colors from '@constants/Colors'
import Emojis from '@constants/Emojis'
import Options from '@constants/Options'
import Reply from '@helpers/Reply'
import Utils from '@helpers/Utils'
import { Duration } from '@sapphire/time-utilities'
import Client from '@structures/Client'
import Premium from '@structures/Premium'
import Save from '@structures/Save'
import Moderation from '@structures/moderation/Moderation'
import ModerationRules, { ModerationRuleRegex } from '@structures/moderation/ModerationRules'
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, MessageActionRowComponentBuilder, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, StringSelectMenuBuilder, StringSelectMenuInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'

export default class RuleSettings {
  public static async initialMessage(client: Client, interaction: ButtonInteraction<'cached'> | ModalMessageModalSubmitInteraction<'cached'> | StringSelectMenuInteraction<'cached'>, id: string) {
    const moderationData = await Moderation.cache(client, interaction.guildId, false, true)
    const rulesData = await ModerationRules.cache(client, interaction.guildId, false, true)
    const premiumData = await Premium.cache(client, interaction.guildId)

    const buttons = [
      [
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, 'moderationRulesStatus', 'button'))
          .setLabel(`${moderationData.rules ? 'Disable' : 'Enable'} rule${rulesData?.rules && rulesData.rules.length > 0 ? 's' : ''}`)
          .setEmoji(`${moderationData.rules ? Emojis.enable : Emojis.disable}`)
          .setStyle(SettingsUtils.generateStyle(moderationData.rules)),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, 'moderationRulesAdd', 'button'))
          .setLabel('Add rule')
          .setEmoji(Emojis.addField)
          .setStyle(SettingsUtils.defaultStyle)
      ],
      [
        SettingsUtils.generateBack('settings', id, 'moderationBack.moderationRules'),
        SettingsUtils.generateSave('settings', id, 'moderationSave.moderationRules', client, interaction.guildId, 'moderation'),
        SettingsUtils.generateRestore('settings', id, 'moderationRestore.moderationRules')
      ]
    ]

    if (!moderationData.rules) {
      buttons[0][1].setDisabled(true)
    }

    else if (premiumData?.status() && moderationData.rules && rulesData?.rules && rulesData?.rules.length >= 20) {
      buttons[0][1].setDisabled(true)
    }

    else if (interaction.guildId && !premiumData?.status() && rulesData?.rules.length && rulesData.rules.length >= 5) {
      buttons[0][1].setDisabled(true)
    }

    else {
      buttons[0][1].setDisabled(false)
    }

    const actionRows = [
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[0]),
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[1])
    ]

    if (rulesData?.rules && rulesData.rules.length >= 1) {
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(SettingsUtils.generateId('settings', id, 'moderationRules', 'select'))
        .setPlaceholder(`Select to edit`)
        .setDisabled(!moderationData.rules || rulesData.rules.length == 0)
        .addOptions(
          rulesData.rules.map(rule => {
            return {
              label: `${Utils.capitalize(rule.action)}`,
              description: `${Utils.capitalize(rule.action)} user after ${rule.quantity} ${rule.quantity > 1 ? 'a' : ''} warning${rule.quantity > 1 ? 's' : ''}`,
              value: `${rule.quantity}`
            }
          })
        )

      actionRows.unshift(new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(selectMenu))
    }

    const links = [
      `[Docs](${Options.docsLink}/moderation/rules)`,
      `[Action types](${Options.docsLink}/moderation/rules#action-types)`,
      `[Duration](${Options.docsLink}/moderation/rules#action-duration)`,
      `[Quantity](${Options.docsLink}/moderation/rules#action-duration)`
    ].map(link => `${Emojis.point} ${link}`).join('\n')

    try {
      await Reply.reply({
        client,
        interaction: interaction,
        author: 'Setup rules',
        description: 'Create moderation rule to punish users after specified amount of warnings.',
        fields: [{ name: 'Useful links', value: links, inline: false }],
        color: Colors.primary,
        components: actionRows
      })
    } catch (err) {
      console.log(err)
    }
  }

  public static async addRequest(client: Client, interaction: ButtonInteraction<'cached'>, id: string) {
    const ruleTypeInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'moderationRulesAction', 'input'))
      .setLabel('Action type')
      .setPlaceholder('Choose the action.')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
    const ruleQuantityInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'moderationRulesQuantity', 'input'))
      .setLabel('Warning amount')
      .setPlaceholder('Enter the amount of warnings to trigger on.')
      .setMaxLength(4)
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
    const ruleDurationInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'moderationRulesDuration', 'input'))
      .setLabel('Duration')
      .setPlaceholder('Enter the duration of the action.')
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
      .setTitle('Rule setup')
      .addComponents(actionRows)

    await interaction.showModal(modal)
  }

  public static async addResponse(client: Client, interaction: ModalMessageModalSubmitInteraction<'cached'>, id: string) {
    const moderationData = await Moderation.cache(client, interaction.guildId, false, true)
    const rulesData = await ModerationRules.cache(client, interaction.guildId, false, true)
    const save = Save.cache(client, `${interaction.guildId}-moderation`)

    const ruleAction = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'moderationRulesAction', 'input')).toLowerCase()
    const ruleQuantity = parseInt(interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'moderationRulesQuantity', 'input')))
    const ruleDuration = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'moderationRulesDuration', 'input')).toLowerCase()

    const duration = new Duration(ruleDuration)

    if (!moderationData) return
    if (!ruleAction.match(ModerationRuleRegex)) return
    if (ruleQuantity == 0 || rulesData?.rules.some(rule => rule.quantity == ruleQuantity)) return

    if (ruleAction != 'ban' && ruleAction != 'softban' && ruleAction != 'kick') {
      if (ruleDuration != 'permanent' && parseInt(ruleDuration) != 0 && isNaN(duration.offset)) return
      if (ruleAction == 'restriction' && duration.offset > 1209600000) return
      if (duration.offset > 31556952000) return
    }

    rulesData?.rules?.push({
      guild: interaction.guildId,
      action: ruleAction,
      quantity: ruleQuantity,
      duration: ruleDuration
    })

    save.count += 1

    await this.initialMessage(client, interaction, id)
  }

  public static async editRequest(client: Client, interaction: StringSelectMenuInteraction<'cached'>, id: string) {
    const rulesData = await ModerationRules.cache(client, interaction.guildId, false, true)
    const ruleId = interaction.values[0]

    if (!ruleId) return

    const ruleData = rulesData?.rules.find(rule => rule.quantity == parseInt(ruleId))

    const ruleActionInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'moderationRulesActionUpdate', 'input'))
      .setLabel('Action type')
      .setPlaceholder('Choose the action.')
      .setValue(`${ruleData?.action}`)
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
    const ruleQuantityInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'moderationRulesQuantityUpdate', 'input'))
      .setLabel('Warning amount')
      .setPlaceholder('Enter the amount of warnings to trigger on.')
      .setValue(`${ruleData?.quantity}`)
      .setMaxLength(4)
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
    const ruleDurationInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'moderationRulesDurationUpdate', 'input'))
      .setLabel('Action duration')
      .setPlaceholder('Enter the duration of the action.')
      .setValue(`${ruleData?.duration}`)
      .setStyle(TextInputStyle.Short)
      .setRequired(false)

    const actionRows = [
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(ruleActionInput),
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

  public static async editResponse(client: Client, interaction: ModalMessageModalSubmitInteraction<'cached'>, id: string, ruleId: string) {
    const moderationData = await Moderation.cache(client, interaction.guildId, false, true)
    const rulesData = await ModerationRules.cache(client, interaction.guildId, false, true)
    const save = Save.cache(client, `${interaction.guildId}-moderation`)
    const currentRuleQuantity = parseInt(ruleId)

    const ruleAction = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'moderationRulesActionUpdate', 'input')).toLowerCase()
    const ruleQuantity = parseInt(interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'moderationRulesQuantityUpdate', 'input')))
    const ruleDuration = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'moderationRulesDurationUpdate', 'input')).toLowerCase()

    if (!moderationData) return
    if (!ruleAction.match(ModerationRuleRegex)) return console.log('error regex', ruleAction)
    if (!rulesData?.rules) return

    if (ruleAction != 'ban' && ruleAction != 'softban' && ruleAction != 'kick') {
      const duration = new Duration(ruleDuration) ?? undefined

      if (ruleDuration != 'permanent' && parseInt(ruleDuration) != 0 && isNaN(duration.offset)) return
      if (ruleAction == 'restriction' && duration.offset > 1209600000) return
      if (duration.offset > 31556952000) return
    }

    if (ruleQuantity != currentRuleQuantity) {
      if (rulesData?.rules.some(rule => rule.quantity == ruleQuantity)) {
        return console.log('Rule already exists.')
      }
    }

    if (ruleQuantity == 0 && rulesData?.rules) {
      rulesData.rules = rulesData.rules.filter(rule => rule.quantity != currentRuleQuantity)
    }

    else {
      const index = rulesData?.rules.findIndex(rule => rule.quantity == currentRuleQuantity)

      if ((index == 0 || index) && rulesData?.rules) {
        console.log('Updated from: ' + rulesData.rules[index].action + ' => ' + ruleAction)

        rulesData.rules[index] = {
          guild: interaction.guildId,
          action: ruleAction,
          quantity: ruleQuantity,
          duration: ruleDuration.replace(/$0^|$permanent^/, 'permanent') ?? undefined
        }
      }
    }

    save.count += 1

    await this.initialMessage(client, interaction, id)
  }
}