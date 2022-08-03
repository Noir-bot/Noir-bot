import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, MessageActionRowComponentBuilder, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, SelectMenuBuilder, SelectMenuInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'
import Colors from '../../../../../constants/Colors'
import Options from '../../../../../constants/Options'
import NoirClient from '../../../../../structures/Client'

export default class SettingsCommandWelcomeRoles {
  public static async initialMessage(client: NoirClient, interaction: ButtonInteraction | ModalMessageModalSubmitInteraction | SelectMenuInteraction, id: string) {
    const welcomeData = client.welcomeSettings.get(id)

    const buttons = [
      [
        new ButtonBuilder()
          .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeRolesAdd', 'button'))
          .setLabel('Add role')
          .setStyle(client.componentsUtils.defaultStyle)
          .setDisabled(!welcomeData?.data.status || welcomeData.data.roles.length == 2 && !client.utils.premiumStatus(id) || welcomeData.data.roles.length == 5),
        new ButtonBuilder()
          .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeRolesRemove', 'button'))
          .setLabel('Remove roles')
          .setStyle(client.componentsUtils.defaultStyle)
          .setDisabled(!welcomeData?.data.status || welcomeData.data.roles.length < 1),
      ],
      [
        new ButtonBuilder()
          .setCustomId(client.componentsUtils.generateId('settings', id, 'welcome', 'button'))
          .setLabel('Back to welcome settings')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeSave', 'button'))
          .setLabel('Save welcome roles settings')
          .setStyle(ButtonStyle.Primary)
      ]
    ]

    const actionRows = [
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[0]),
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons[1])
    ]

    await client.reply.reply({
      interaction: interaction,
      color: Colors.primary,
      author: 'Welcome settings',
      authorImage: Options.clientAvatar,
      description: 'Welcome auto roles editor. Add or remove multiple roles for welcome.',
      components: actionRows,
      ephemeral: true,
    })
  }

  public static async addRequest(client: NoirClient, interaction: ButtonInteraction, id: string) {
    const welcomeData = client.welcomeSettings.get(id)

    const channelInput = new TextInputBuilder()
      .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeRolesAdd', 'input'))
      .setLabel('Role Id')
      .setPlaceholder('Enter role Id to add')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)

    if (welcomeData?.data.webhook) {
      channelInput.setValue(welcomeData.data.webhook)
    }

    const actionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>()
      .addComponents(channelInput)
    const modal = new ModalBuilder()
      .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeRolesAdd', 'modal'))
      .setTitle('Add welcome role')
      .addComponents(actionRow)

    await interaction.showModal(modal)
  }

  public static async addResponse(client: NoirClient, interaction: ModalMessageModalSubmitInteraction, id: string) {
    const roleId = interaction.fields.getTextInputValue(client.componentsUtils.generateId('settings', id, 'welcomeRolesAdd', 'input'))
    const guildId = interaction.guild?.id
    const welcomeData = client.welcomeSettings.get(id)

    if (!guildId) return

    welcomeData?.addRole(client, guildId, roleId)

    await this.initialMessage(client, interaction, id)
  }

  public static async removeRequest(client: NoirClient, interaction: ButtonInteraction, id: string) {
    const welcomeData = client.welcomeSettings.get(id)

    if (!welcomeData) return

    const buttons = [
      new ButtonBuilder()
        .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeRoles', 'button'))
        .setLabel('Back to welcome role settings')
        .setStyle(ButtonStyle.Primary)
    ]

    const selectMenu = new SelectMenuBuilder()
      .setCustomId(client.componentsUtils.generateId('settings', id, 'welcomeRolesRemove', 'select'))
      .setPlaceholder('Choose role(s) to remove')
      .setMaxValues(welcomeData.data.roles.length)
      .setMinValues(1)
      .addOptions(welcomeData.data.roles.map(roleId => {
        const role = interaction.guild?.roles.cache.get(roleId)

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
        author: 'Welcome roles settings',
        description: 'Select role(s) to remove',
        color: Colors.primary,
        components: [selectMenuActionRow, buttonActionRow]
      })
    } catch (err) {
      return console.log(err)
    }
  }

  public static async removeResponse(client: NoirClient, interaction: SelectMenuInteraction, id: string) {
    const welcomeData = client.welcomeSettings.get(id)
    const roles = interaction.values

    roles.forEach(role => {
      welcomeData?.removeRole(role)
    })

    await this.initialMessage(client, interaction, id)
  }
}