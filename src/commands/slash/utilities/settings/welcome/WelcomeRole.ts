import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, MessageActionRowComponentBuilder, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, SelectMenuBuilder, SelectMenuInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'
import Colors from '../../../../../constants/Colors'
import Options from '../../../../../constants/Options'
import NoirClient from '../../../../../structures/Client'
import SettingsUtils from '../SettingsUtils'
import WelcomeSettings from './WelcomeSettings'

export default class WelcomeRole {
  public static async initialMessage(client: NoirClient, interaction: ButtonInteraction | ModalMessageModalSubmitInteraction | SelectMenuInteraction, id: string) {
    let welcomeData = client.welcomeSettings.get(id)?.data

    if (!welcomeData) {
      welcomeData = await WelcomeSettings.generateCache(client, id)
    }

    if (!welcomeData) return

    const buttons = [
      [
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeRolesAdd', 'button'))
          .setLabel('Add role')
          .setStyle(SettingsUtils.defaultStyle)
          .setDisabled(!welcomeData?.status || welcomeData.roles.length == 2 && !client.utils.premiumStatus(id) || welcomeData.roles.length == 5),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeRolesEdit', 'button'))
          .setLabel(`Edit roles`)
          .setStyle(SettingsUtils.defaultStyle)
          .setDisabled(!welcomeData?.status || welcomeData.roles.length < 1),
        new ButtonBuilder()
          .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeRolesClear', 'button'))
          .setLabel(`Clear roles`)
          .setStyle(SettingsUtils.warningStyle)
          .setDisabled(!welcomeData?.status || welcomeData.roles.length < 1),
      ],
      [
        SettingsUtils.generateBack('settings', id, 'welcomeBack'),
        SettingsUtils.generateSave('settings', id, 'welcomeSave.welcomeRoles'),
        SettingsUtils.generateRestore('settings', id, 'welcomeRestore.welcomeRoles')
      ]
    ]

    const actionRows = [
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[0]),
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[1])
    ]

    await client.reply.reply({
      interaction: interaction,
      color: Colors.primary,
      author: 'Welcome roles settings',
      authorImage: Options.clientAvatar,
      description: 'Setup auto-role and automatically give roles to new users when they join.',
      components: actionRows,
      ephemeral: true,
    })
  }

  public static async addRequest(client: NoirClient, interaction: ButtonInteraction, id: string) {
    const channelInput = new TextInputBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeRolesAdd', 'input'))
      .setLabel('Role id')
      .setPlaceholder('Enter the role id')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)

    const actionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>()
      .addComponents(channelInput)
    const modal = new ModalBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeRolesAdd', 'modal'))
      .setTitle('Add role')
      .addComponents(actionRow)

    await interaction.showModal(modal)
  }

  public static async editRequest(client: NoirClient, interaction: ButtonInteraction, id: string) {
    let welcomeData = client.welcomeSettings.get(id)?.data

    if (!welcomeData) {
      welcomeData = await WelcomeSettings.generateCache(client, id)
    }

    if (!welcomeData) return

    const button = SettingsUtils.generateBack('settings', id, 'welcomeBack.welcomeRolesEdit')

    const selectMenu = new SelectMenuBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeRolesEdit', 'select'))
      .setPlaceholder(`Select role${welcomeData.roles.length > 1 ? 's' : ''} to remove`)
      .setMaxValues(welcomeData.roles.length)
      .setMinValues(1)
      .addOptions(welcomeData.roles.map(id => {
        const role = interaction.guild?.roles.cache.get(id)

        return {
          label: `${role?.name}`,
          description: `${role?.id}`,
          value: `${role?.id}`
        }
      }))

    const selectMenuActionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(selectMenu)
    const buttonActionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents([button])

    try {
      await client.reply.reply({
        interaction: interaction,
        author: 'Edit roles',
        description: 'Edit currently active roles. Choose roles you want to remove.',
        color: Colors.primary,
        components: [selectMenuActionRow, buttonActionRow]
      })
    } catch {
      return
    }
  }

  public static async addResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string) {
    let welcomeData = client.welcomeSettings.get(id)?.data
    const guildId = interaction.guild?.id
    const roleId = interaction.fields.getTextInputValue(SettingsUtils.generateId('settings', id, 'welcomeRolesAdd', 'input'))

    if (!welcomeData) {
      welcomeData = await WelcomeSettings.generateCache(client, id)
    }

    if (!welcomeData || !guildId) return

    const role = client.guilds.cache.get(guildId)?.roles.cache.get(roleId)

    if (!role) return
    if (welcomeData.roles.length == 2 && !client.utils.premiumStatus(guildId) || welcomeData.roles.length == 5) return
    if (welcomeData.roles.includes(roleId)) return

    welcomeData.roles.push(role.id)

    await this.initialMessage(client, interaction, id)
  }

  public static async editResponse(client: NoirClient, interaction: SelectMenuInteraction, id: string) {
    let welcomeData = client.welcomeSettings.get(id)?.data
    const values = interaction.values

    if (!welcomeData) {
      welcomeData = await WelcomeSettings.generateCache(client, id)
    }

    if (!welcomeData || !values) return

    values.forEach(roleId => {
      if (!welcomeData?.roles.includes(roleId)) return
      welcomeData.roles = welcomeData.roles.filter(role => role != roleId)
    })

    await this.initialMessage(client, interaction, id)
  }

  public static async clearResponse(client: NoirClient, interaction: ButtonInteraction, id: string) {
    let welcomeData = client.welcomeSettings.get(id)?.data

    if (!welcomeData) {
      welcomeData = await WelcomeSettings.generateCache(client, id)
    }

    if (!welcomeData) return

    welcomeData.roles = []

    await this.initialMessage(client, interaction, id)
  }

  public static async buttonResponse(client: NoirClient, interaction: ButtonInteraction, id: string, method: string) {
    if (method == 'welcomeRoles') {
      await this.initialMessage(client, interaction, id)
    }

    else if (method == 'welcomeRolesAdd') {
      await this.addRequest(client, interaction, id)
    }

    else if (method == 'welcomeRolesEdit') {
      await this.editRequest(client, interaction, id)
    }

    else if (method == 'welcomeRolesClear') {
      await this.clearResponse(client, interaction, id)
    }
  }

  public static async modalResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string, method: string) {
    if (method == 'welcomeRolesAdd') {
      await this.addResponse(client, interaction, id)
    }
  }

  public static async selectResponse(client: NoirClient, interaction: SelectMenuInteraction, id: string, method: string) {
    if (method == 'welcomeRolesEdit') {
      await this.editResponse(client, interaction, id)
    }
  }
}