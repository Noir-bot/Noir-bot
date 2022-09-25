import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, MessageActionRowComponentBuilder, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, SelectMenuBuilder, SelectMenuInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'
import Colors from '../../../../../constants/Colors'
import Options from '../../../../../constants/Options'
import NoirClient from '../../../../../structures/Client'

export default class WelcomeRole {
  public static title = 'Welcome roles setup'

  public static async initialMessage(client: NoirClient, interaction: ButtonInteraction | ModalMessageModalSubmitInteraction | SelectMenuInteraction, id: string) {
    const welcomeData = client.welcomeSettings.get(id)
    const status = !welcomeData?.data.status || welcomeData.data.roles.length == 2 && !client.utils.premiumStatus(id) || welcomeData.data.roles.length == 5
    const childStatus = !welcomeData?.data.status || welcomeData.data.roles.length < 1
    const sStatus = welcomeData && welcomeData.data.roles.length > 1 ? 's' : ''

    const buttons = [
      [
        new ButtonBuilder()
          .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeRoleAdd', 'button'))
          .setLabel('Add role')
          .setStyle(client.componentsUtils.defaultStyle)
          .setDisabled(status),
        new ButtonBuilder()
          .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeRoleEdit', 'button'))
          .setLabel(`Edit role${sStatus}`)
          .setStyle(client.componentsUtils.defaultStyle)
          .setDisabled(childStatus),
        new ButtonBuilder()
          .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeRoleClear', 'button'))
          .setLabel(`Clear role${sStatus}`)
          .setStyle(client.componentsUtils.dangerStyle)
          .setDisabled(childStatus),
      ],
      [
        client.componentsUtils.generateBack('settings', id, 'welcomeBack'),
        client.componentsUtils.generateSave('settings', id, 'welcomeSave.welcomeRole'),
        client.componentsUtils.generateRestore('settings', id, 'welcomeRestore.welcomeRole')
      ]
    ]

    const actionRows = [
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[0]),
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[1])
    ]

    await client.reply.reply({
      interaction: interaction,
      color: Colors.primary,
      author: this.title,
      authorImage: Options.clientAvatar,
      description: 'Welcome auto-role editor. Automatically gives roles to new users.',
      components: actionRows,
      ephemeral: true,
    })
  }

  public static async addRequest(client: NoirClient, interaction: ButtonInteraction, id: string) {
    const channelInput = new TextInputBuilder()
      .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeRoleAdd', 'input'))
      .setLabel('Role id')
      .setPlaceholder('Enter the role id')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)

    const actionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>()
      .addComponents(channelInput)
    const modal = new ModalBuilder()
      .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeRoleAdd', 'modal'))
      .setTitle(this.title)
      .addComponents(actionRow)

    await interaction.showModal(modal)
  }

  public static async editRequest(client: NoirClient, interaction: ButtonInteraction, id: string) {
    const welcomeData = client.welcomeSettings.get(id)

    if (!welcomeData) return

    const buttons = [
      client.componentsUtils.generateBack('settings', id, 'welcomeBack.welcomeRoleEdit')
    ]

    const sStatus = welcomeData.data.roles.length > 1 ? 's' : ''

    const selectMenu = new SelectMenuBuilder()
      .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeRoleEdit', 'select'))
      .setPlaceholder(`Select role${sStatus} to remove`)
      .setMaxValues(welcomeData.data.roles.length)
      .setMinValues(1)
      .addOptions(welcomeData.data.roles.map(id => {
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
      .addComponents(buttons)

    try {
      await client.reply.reply({
        interaction: interaction,
        author: this.title,
        description: 'Edit currently active roles.',
        color: Colors.primary,
        components: [selectMenuActionRow, buttonActionRow]
      })
    } catch {
      return
    }
  }

  public static async addResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string) {
    const welcomeData = client.welcomeSettings.get(id)
    const roleId = interaction.fields.getTextInputValue(client.componentsUtils.generateId('settings', id, 'welcomeRoleAdd', 'input'))
    const guildId = interaction.guild?.id

    if (!guildId) return
    if (!welcomeData) return

    const role = client.guilds.cache.get(guildId)?.roles.cache.get(roleId)

    if (!role) return
    if (welcomeData.data.roles.length == 2 && !client.utils.premiumStatus(guildId) || welcomeData.data.roles.length == 5) return
    if (welcomeData.data.roles.includes(roleId)) return

    welcomeData.data.roles.push(role.id)

    await this.initialMessage(client, interaction, id)
  }

  public static async editResponse(client: NoirClient, interaction: SelectMenuInteraction, id: string) {
    const welcomeData = client.welcomeSettings.get(id)
    const values = interaction.values

    if (!welcomeData) return
    if (!values) return

    values.forEach(roleId => {
      if (!welcomeData.data.roles.includes(roleId)) return
      welcomeData.data.roles = welcomeData.data.roles.filter(role => role != roleId)
    })

    await this.initialMessage(client, interaction, id)
  }

  public static async clearResponse(client: NoirClient, interaction: ButtonInteraction, id: string) {
    const welcomeData = client.welcomeSettings.get(id)

    if (!welcomeData) return

    welcomeData.data.roles = []

    await this.initialMessage(client, interaction, id)
  }

  public static async buttonResponse(client: NoirClient, interaction: ButtonInteraction, id: string, method: string) {
    if (method == 'welcomeRole') {
      await this.initialMessage(client, interaction, id)
    }

    else if (method == 'welcomeRoleAdd') {
      await this.addRequest(client, interaction, id)
    }

    else if (method == 'welcomeRoleEdit') {
      await this.editRequest(client, interaction, id)
    }

    else if (method == 'welcomeRoleClear') {
      await this.clearResponse(client, interaction, id)
    }
  }

  public static async modalResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string, method: string) {
    if (method == 'welcomeRoleAdd') {
      await this.addResponse(client, interaction, id)
    }
  }

  public static async selectResponse(client: NoirClient, interaction: SelectMenuInteraction, id: string, method: string) {
    if (method == 'welcomeRoleEdit') {
      await this.editResponse(client, interaction, id)
    }
  }
}