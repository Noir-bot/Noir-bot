import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, MessageActionRowComponentBuilder, ModalMessageModalSubmitInteraction, roleMention, RoleSelectMenuBuilder, RoleSelectMenuInteraction } from 'discord.js'
import Colors from '../../../../../constants/Colors'
import Options from '../../../../../constants/Options'
import NoirClient from '../../../../../structures/Client'
import Premium from '../../../../../structures/Premium'
import Welcome from '../../../../../structures/Welcome'
import SettingsUtils from '../SettingsUtils'

export default class WelcomeRole {
  public static async initialMessage(client: NoirClient, interaction: ButtonInteraction<'cached'> | ModalMessageModalSubmitInteraction<'cached'> | RoleSelectMenuInteraction<'cached'>, id: string) {
    const premiumData = await Premium.cache(client, interaction.guildId)
    const welcomeData = await Welcome.cache(client, interaction.guildId)

    const selectMenu = new RoleSelectMenuBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeRoles', 'select'))
      .setPlaceholder('Select roles')
      .setMaxValues(premiumData?.status() ? 15 : 3)

    const buttons = [
      SettingsUtils.generateBack('settings', id, 'welcomeBack'),
      SettingsUtils.generateSave('settings', id, 'welcomeSave.welcomeRoles'),
      SettingsUtils.generateRestore('settings', id, 'welcomeRestore.welcomeRoles'),
      new ButtonBuilder()
        .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeRolesClear', 'button'))
        .setLabel('Clear roles')
        .setStyle(ButtonStyle.Danger)
    ]

    const actionRows = [
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(selectMenu),
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons)
    ]

    await client.reply.reply({
      interaction: interaction,
      color: Colors.primary,
      author: 'Welcome roles settings',
      authorImage: Options.clientAvatar,
      description: 'Setup auto-role and automatically give roles to new users when they join.',
      fields: welcomeData.roles && welcomeData.roles.length > 0 ? [{ name: 'Current roles', value: welcomeData.roles.map(role => roleMention(role)).join(', '), inline: false }] : [],
      components: actionRows,
      ephemeral: true,
    })
  }

  public static async rolesResponse(client: NoirClient, interaction: RoleSelectMenuInteraction<'cached'>, id: string) {
    const welcomeData = await Welcome.cache(client, interaction.guildId)
    const premiumData = await Premium.cache(client, interaction.guildId)
    const roleIds = interaction.values

    if (roleIds.length == 0) return
    if (!premiumData?.status() && roleIds.length > 3) return
    if (!premiumData?.status() && welcomeData.roles && welcomeData.roles.length > 3) return

    welcomeData.roles = roleIds

    await this.initialMessage(client, interaction, id)
  }

  public static async clearResponse(client: NoirClient, interaction: ButtonInteraction<'cached'>, id: string) {
    const welcomeData = await Welcome.cache(client, interaction.guildId)

    welcomeData.roles = []

    await this.initialMessage(client, interaction, id)
  }

  public static async selectResponse(client: NoirClient, interaction: RoleSelectMenuInteraction<'cached'>, id: string, method: string) {
    if (method == 'welcomeRoles') {
      await this.rolesResponse(client, interaction, id)
    }
  }
}