import SettingsUtils from '@commands/slash/utilities/settings/SettingsUtils'
import Colors from '@constants/Colors'
import Emojis from '@constants/Emojis'
import Reply from '@helpers/Reply'
import Client from '@structures/Client'
import Premium from '@structures/Premium'
import Save from '@structures/Save'
import Welcome from '@structures/welcome/Welcome'
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, MessageActionRowComponentBuilder, ModalMessageModalSubmitInteraction, roleMention, RoleSelectMenuBuilder, RoleSelectMenuInteraction } from 'discord.js'

export default class WelcomeRole {
  public static async initialMessage(client: Client, interaction: ButtonInteraction<'cached'> | ModalMessageModalSubmitInteraction<'cached'> | RoleSelectMenuInteraction<'cached'>, id: string) {
    const premiumData = await Premium.cache(client, interaction.guildId)
    const welcomeData = await Welcome.cache(client, interaction.guildId, false, true)

    const selectMenu = new RoleSelectMenuBuilder()
      .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeRoles', 'select'))
      .setPlaceholder('Select roles')
      .setMaxValues(premiumData?.status() ? 7 : 3)

    const buttons = [
      SettingsUtils.generateBack('settings', id, 'welcomeBack'),
      SettingsUtils.generateSave('settings', id, 'welcomeSave.welcomeRoles', client, interaction.guildId, 'welcome'),
      SettingsUtils.generateRestore('settings', id, 'welcomeRestore.welcomeRoles'),
      new ButtonBuilder()
        .setCustomId(SettingsUtils.generateId('settings', id, 'welcomeRolesClear', 'button'))
        .setLabel('Clear roles')
        .setEmoji(Emojis.trash)
        .setStyle(ButtonStyle.Danger)
    ]

    const actionRows = [
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(selectMenu),
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons)
    ]

    await Reply.reply({
      client: client,
      interaction: interaction,
      color: Colors.primary,
      author: 'Roles settings',
      authorImage: client.user?.avatarURL(),
      description: welcomeData.roles && welcomeData.roles.length > 0 ? `Current roles ${welcomeData.roles.map(role => roleMention(role)).join(', ')}` : 'No roles',
      components: actionRows,
      ephemeral: true,
    })
  }

  public static async rolesResponse(client: Client, interaction: RoleSelectMenuInteraction<'cached'>, id: string) {
    const welcomeData = await Welcome.cache(client, interaction.guildId, false, true)
    const premiumData = await Premium.cache(client, interaction.guildId)
    const roleIds = interaction.values

    if (roleIds.length == 0) return
    if (!premiumData?.status() && roleIds.length > 3) return
    if (!premiumData?.status() && welcomeData.roles && welcomeData.roles.length > 3) return

    welcomeData.roles = roleIds

    const saves = Save.cache(client, `${interaction.guildId}-welcome`)

    saves.count += 1

    await this.initialMessage(client, interaction, id)
  }

  public static async clearResponse(client: Client, interaction: ButtonInteraction<'cached'>, id: string) {
    const welcomeData = await Welcome.cache(client, interaction.guildId, false, true)

    welcomeData.roles = []

    const saves = Save.cache(client, `${interaction.guildId}-welcome`)

    saves.count += 1

    await this.initialMessage(client, interaction, id)
  }

  public static async selectResponse(client: Client, interaction: RoleSelectMenuInteraction<'cached'>, id: string, method: string) {
    if (method == 'welcomeRoles') {
      await this.rolesResponse(client, interaction, id)
    }
  }
}