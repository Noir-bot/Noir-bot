import Colors from '@constants/Colors'
import Emojis from '@constants/Emojis'
import RateLimit from '@helpers/RateLimit'
import Reply from '@helpers/Reply'
import Utils from '@helpers/Utils'
import Client from '@structures/Client'
import Infraction from '@structures/Infraction'
import ChatCommand from '@structures/commands/ChatCommand'
import { AccessType, CommandCategory, CommandType } from '@structures/commands/Command'
import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, MessageActionRowComponentBuilder, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, StringSelectMenuBuilder, StringSelectMenuInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'

export default class InfractionsCommand extends ChatCommand {
  constructor(client: Client) {
    super(
      client,
      {
        permissions: ['EmbedLinks'],
        category: CommandCategory.Moderation,
        access: AccessType.Moderation,
        type: CommandType.Public,
        status: true,
        rateLimit: 10
      },
      {
        name: 'infractions',
        description: 'Control user infractions.',
        defaultMemberPermissions: ['ManageGuild'],
        dmPermission: false,
        options: [
          {
            name: 'user',
            description: 'The user to get infractions for',
            type: ApplicationCommandOptionType.User,
            required: true
          }
        ]
      }
    )
  }

  public async execute(client: Client, interaction: ChatInputCommandInteraction<'cached'>): Promise<void> {
    const user = interaction.options.getUser('user', true)

    await InfractionsCommand.initialMessage(client, interaction, user.id)
  }

  public static async initialMessage(client: Client, interaction: ChatInputCommandInteraction<'cached'> | ButtonInteraction<'cached'> | ModalMessageModalSubmitInteraction<'cached'>, userId: string, page?: number): Promise<void> {
    const infractionData = await Infraction.cache(client, interaction.guildId, userId)

    if (infractionData?.cases.length == 0 || !infractionData) {
      Reply.reply({
        client,
        interaction,
        color: Colors.warning,
        author: 'Data error',
        description: 'There are no infractions for this user.'
      })

      return
    }

    let { cases, nextPageStatus, prevPageStatus } = infractionData.getCasesByPage(page ?? 1)

    if (cases.length == 0) {
      const newData = infractionData.getCasesByPage(1)

      nextPageStatus = newData.nextPageStatus
      prevPageStatus = newData.prevPageStatus
      cases = newData.cases
    }

    const buttons = [
      [
        new ButtonBuilder()
          .setCustomId(Infraction.generateId(infractionData.id, page ?? 1, 'previous'))
          .setLabel('Previous page')
          .setEmoji(Emojis.leftArrow)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(!prevPageStatus),
        new ButtonBuilder()
          .setCustomId(Infraction.generateId(infractionData.id, page ?? 1, 'next'))
          .setLabel('Next page')
          .setEmoji(Emojis.rightArrow)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(!nextPageStatus),
        new ButtonBuilder()
          .setCustomId(Infraction.generateId(infractionData.id, page ?? 1, 'refresh'))
          .setEmoji(Emojis.refresh)
          .setLabel('Refresh')
          .setStyle(ButtonStyle.Secondary)
      ],
      [
        new ButtonBuilder()
          .setCustomId(Infraction.generateId(infractionData.id, page ?? 1, 'delete'))
          .setLabel('Remove infraction')
          .setEmoji(Emojis.eraser)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(!cases.length),
        new ButtonBuilder()
          .setCustomId(Infraction.generateId(infractionData.id, page ?? 1, 'clear'))
          .setLabel('Clear infractions')
          .setEmoji(Emojis.trash)
          .setStyle(ButtonStyle.Danger)
          .setDisabled(!cases.length)
      ]
    ]

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(Infraction.generateId(infractionData.id, page ?? 1, 'edit'))
      .setDisabled(!cases.length)
      .setPlaceholder('Select a case to edit')
      .addOptions(cases.map(data => {
        return {
          label: `Case #${data.id}`,
          description: `${Utils.capitalize(data.action)} case for "${data.reason}"` ?? `${Utils.capitalize(data.action)} case without any provided reason.`,
          value: data.id.toString(),
          emoji: data.action == 'ban' ? Emojis.ban : data.action == 'timeout' ? Emojis.timeout : data.action == 'kick' ? Emojis.kick : Emojis.warn
        }
      }))
      .setMinValues(1)

    const actionRows = [
      new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(selectMenu),
      new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(buttons[0]),
      new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(buttons[1])
    ]

    const user = client.users.cache.get(userId) ?? await client.users.fetch(userId)

    await Reply.reply({
      client,
      interaction,
      title: 'Control infractions',
      author: `${user.username}\`s infractions`,
      authorImage: user.displayAvatarURL(),
      components: actionRows
    })
  }

  public static async button(client: Client, interaction: ButtonInteraction<'cached'>): Promise<void> {
    const parts = interaction.customId.split('-')
    const id = parts[1].toLowerCase()
    const page = parts[2].toLowerCase()
    const action = parts[3].toLowerCase()

    console.log(id, page, action)

    if (action == 'refresh') {
      const rateLimited = RateLimit.limit(client, `${interaction.user.id}-infractionRefresh`, 15)

      if (rateLimited) {
        RateLimit.message({
          client,
          interaction,
          id: `${interaction.user.id}-infractionRefresh`
        })

        return
      }

      const [guild, user] = id.split('.')

      await Infraction.cache(client, guild, user, true)
      await InfractionsCommand.initialMessage(client, interaction, user, parseInt(page))
    }

    else if (action == 'previous') {
      const [_, user] = id.split('.')

      await InfractionsCommand.initialMessage(client, interaction, user, parseInt(page) - 1)
    }

    else if (action == 'next') {
      const [_, user] = id.split('.')

      await InfractionsCommand.initialMessage(client, interaction, user, parseInt(page) + 1)
    }

    else if (action == 'delete') {
      const rateLimited = RateLimit.limit(client, `${interaction.user.id}-infractionDelete`, 15)

      if (rateLimited) {
        RateLimit.message({
          client,
          interaction,
          id: `${interaction.user.id}-infractionDelete`
        })

        return
      }

      await InfractionsCommand.deleteRequest(client, interaction, parseInt(page))
    }

    else if (action == 'clear') {
      const rateLimited = RateLimit.limit(client, `${interaction.user.id}-infractionClear`, 30)

      if (rateLimited) {
        RateLimit.message({
          client,
          interaction,
          id: `${interaction.user.id}-infractionClear`
        })

        return
      }

      const [guild, user] = id.split('.')

      await InfractionsCommand.clearResponse(client, interaction, parseInt(page), guild, user)
    }
  }

  public static async modal(client: Client, interaction: ModalMessageModalSubmitInteraction<'cached'>): Promise<void> {
    const parts = interaction.customId.split('-')
    const page = parts[2].toLowerCase()
    const action = parts[3].toLowerCase()

    console.log(parts)

    if (action == 'deletemodal') {
      const [guild, user] = parts[1].split('.')
      const componentId = parts[1]

      this.deleteResponse(client, interaction, parseInt(page), guild, user, componentId)
    }

    else if (action == 'editmodal') {
      const [guild, user] = parts[1].split('.')
      const componentId = parts[1]
      const id = parts[4]

      this.editResponse(client, interaction, parseInt(page), guild, user, componentId, id)
    }
  }

  public static async select(client: Client, interaction: StringSelectMenuInteraction<'cached'>): Promise<void> {
    const parts = interaction.customId.split('-')
    const page = parts[2].toLowerCase()
    const action = parts[3].toLowerCase()

    if (action == 'edit') {
      const [guild, user] = parts[1].split('.')
      const id = interaction.values[0]

      await InfractionsCommand.editRequest(client, interaction, parseInt(page), guild, user, id)
    }
  }

  public static async editRequest(client: Client, interaction: StringSelectMenuInteraction<'cached'>, page: number, guild: string, user: string, id: string): Promise<void> {
    const data = await Infraction.cache(client, guild, user, false)
    const componentId = interaction.customId.split('-')[1]
    const reason = data?.cases.find(infraction => infraction.id == parseInt(id))

    const idInput = new TextInputBuilder()
      .setCustomId(Infraction.generateId(componentId, page, 'editReason'))
      .setStyle(TextInputStyle.Short)
      .setLabel('Infraction reason')
      .setPlaceholder('Enter new reason')
      .setValue(reason?.reason ?? 'No reason provided')
      .setMinLength(1)

    const actionRows = [
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(idInput)
    ]

    const modal = new ModalBuilder()
      .setCustomId(Infraction.generateId(componentId, page, 'editModal') + '-' + id)
      .setTitle('Infraction editor')
      .addComponents(actionRows)

    await interaction.showModal(modal)
  }

  public static async editResponse(client: Client, interaction: ModalMessageModalSubmitInteraction<'cached'>, page: number, guild: string, user: string, componentId: string, id: string): Promise<void> {
    const reason = interaction.fields.getTextInputValue(Infraction.generateId(componentId, page, 'editReason'))
    const infractionData = await Infraction.cache(client, guild, user)
    const infraction = infractionData?.cases.find(infraction => infraction.id == parseInt(id))

    console.log(id)
    console.log(reason)
    console.log(infraction)

    if (!infraction) return

    await client.prisma.case.update({
      where: {
        id: parseInt(id)
      },
      data: {
        reason: reason
      }
    }).then(async () => {
      await Infraction.cache(client, guild, user, true)
      this.initialMessage(client, interaction, user, page)
    }).catch(error => {
      console.log(error)
    })
  }

  public static async deleteRequest(client: Client, interaction: ButtonInteraction<'cached'>, page: number): Promise<void> {
    const componentId = interaction.customId.split('-')[1]

    const idInput = new TextInputBuilder()
      .setCustomId(Infraction.generateId(componentId, page, 'deleteId'))
      .setStyle(TextInputStyle.Short)
      .setLabel('Infraction ID')
      .setPlaceholder('Enter valid infraction ID')
      .setMinLength(1)

    const actionRows = [
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(idInput)
    ]

    const modal = new ModalBuilder()
      .setCustomId(Infraction.generateId(componentId, page, 'deleteModal'))
      .setTitle('Infraction editor')
      .addComponents(actionRows)

    await interaction.showModal(modal)
  }

  public static async deleteResponse(client: Client, interaction: ModalMessageModalSubmitInteraction<'cached'>, page: number, guild: string, user: string, componentId: string): Promise<void> {
    const id = interaction.fields.getTextInputValue(Infraction.generateId(componentId, page, 'deleteId')).split(',').map(id => id.trim())
    const infractionData = await Infraction.cache(client, guild, user)

    if (!infractionData) return

    try {
      let deletion

      if (id.length > 1) {
        deletion = await client.prisma.case.deleteMany({
          where: {
            id: {
              in: id.map(id => parseInt(id))
            }
          }
        })
      }

      else {
        deletion = await client.prisma.case.delete({
          where: {
            id: parseInt(id[0])
          }
        })
      }

      if (!deletion) return

      await Infraction.cache(client, guild, user, true)
      this.initialMessage(client, interaction, user, page)
    } catch (error) {
      console.log(error)

      return
    }
  }

  public static async clearResponse(client: Client, interaction: ButtonInteraction<'cached'>, page: number, guild: string, user: string) {
    const infractionData = await Infraction.cache(client, guild, user)

    if (!infractionData) return

    try {
      await client.prisma.case.deleteMany({
        where: {
          user: user,
          guild: guild
        }
      })

      await Infraction.cache(client, guild, user, true)
      this.initialMessage(client, interaction, user, page)
    } catch (error) {
      console.log(error)

      return
    }
  }
}