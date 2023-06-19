import Colors from '@constants/Colors'
import Emojis from '@constants/Emojis'
import Reply from '@helpers/Reply'
import Client from '@structures/Client'
import Premium from '@structures/Premium'
import Welcome from '@structures/welcome/Welcome'
import WelcomeMessage from '@structures/welcome/WelcomeMessage'
import { ActionRowBuilder, AnySelectMenuInteraction, ButtonBuilder, ButtonInteraction, ButtonStyle, ChannelSelectMenuBuilder, ChannelSelectMenuInteraction, ChannelType, MessageActionRowComponentBuilder, RoleSelectMenuBuilder, RoleSelectMenuInteraction, channelMention, roleMention } from 'discord.js'

export default class HelpWizardWelcome {
  public static async initialMessage(client: Client, interaction: ButtonInteraction<'cached'> | AnySelectMenuInteraction<'cached'>) {
    const premiumData = await Premium.cache(client, interaction.guildId)
    const welcomeData = await Welcome.cache(client, interaction.guildId, false, true)

    const roleMenu = new RoleSelectMenuBuilder()
      .setCustomId('help-welcome-role')
      .setPlaceholder('Roles for new members')
      .setMaxValues(premiumData?.status() ? 7 : 3)

    const channelMenu = new ChannelSelectMenuBuilder()
      .setChannelTypes(ChannelType.GuildText)
      .setCustomId('help-welcome-channel')
      .setPlaceholder('Channel to greet new members')
      .setMaxValues(1)
      .setMinValues(1)

    const buttons = [
      new ButtonBuilder()
        .setCustomId('help-welcome-back')
        .setLabel('Previous (setup)')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(Emojis.wizard),
      new ButtonBuilder()
        .setCustomId('help-welcome-next')
        .setLabel('Next (moderation)')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(Emojis.moderation)
    ]

    const actionRows = [
      new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(buttons),
      new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(roleMenu),
      new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(channelMenu)
    ]

    await Reply.reply({
      client,
      interaction: interaction,
      color: Colors.primary,
      description: `# Welcome setup\nGreet new users with our amazing tools. Check out other welcoming features with </settings:${client.commandsId.get('settings')}> command.\n\n${welcomeData.roles?.length && welcomeData.roles?.length > 0 ? `- New members roles ${welcomeData.roles?.map(id => roleMention(id)).join(', ')}` : ''}${welcomeData.webhookChannel ? `\n- Greeting channel ${channelMention(welcomeData.webhookChannel)}` : ''}`,
      image: 'https://i.imgur.com/AuI6NPU.png',
      components: actionRows
    })
  }

  public static async rolesResponse(client: Client, interaction: RoleSelectMenuInteraction<'cached'>) {
    const welcomeData = await Welcome.cache(client, interaction.guildId, false, true)
    const premiumData = await Premium.cache(client, interaction.guildId)
    const roleIds = interaction.values

    if (roleIds.length == 0) return
    if (!premiumData?.status() && roleIds.length > 3) return
    if (!premiumData?.status() && welcomeData.roles && welcomeData.roles.length > 3) return

    welcomeData.roles = roleIds
    welcomeData.status = true

    await this.initialMessage(client, interaction)
  }

  public static async channelResponse(client: Client, interaction: ChannelSelectMenuInteraction<'cached'>) {
    const welcomeData = await Welcome.cache(client, interaction.guildId, false, true)
    const messageDataJoin = await WelcomeMessage.cache(client, interaction.guildId, 'guild_join', false, true)
    const messageDataLeft = await WelcomeMessage.cache(client, interaction.guildId, 'guild_left', false, true)
    const channelId = interaction.values[0]

    welcomeData.status = true
    welcomeData.webhookChannel = channelId
    messageDataJoin.color = messageDataJoin.color ?? Colors.successHex
    messageDataLeft.color = messageDataLeft.color ?? Colors.warningHex
    messageDataJoin.description = messageDataJoin.description ?? '{{user name}} welcome to {{guild name}}'
    messageDataLeft.description =  messageDataLeft.description ?? '{{user name}} left {{guild name}}'

    await this.initialMessage(client, interaction)
  }
}