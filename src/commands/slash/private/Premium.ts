import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10'
import { ChatInputCommandInteraction } from 'discord.js'
import { colors } from '../../../libs/config/design'
import NoirClient from '../../../libs/structures/Client'
import NoirChatCommand from '../../../libs/structures/command/ChatCommand'

export default class PremiumCommand extends NoirChatCommand {
  constructor(client: NoirClient) {
    super(
      client,
      {
        permissions: ['SendMessages', 'EmbedLinks'],
        category: 'utility',
        access: 'private',
        type: 'private',
        status: true
      },
      {
        name: 'premium',
        description: 'Enable premium features for user',
        type: ApplicationCommandType.ChatInput,
        options: [
          {
            name: 'guild',
            description: 'Premium guild id',
            type: ApplicationCommandOptionType.String,
            required: true
          },
          {
            name: 'duration',
            description: 'Premium duration time',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
              {
                name: 'test',
                value: '5000'
              },
              {
                name: '3 days',
                value: '259200000'
              },
              {
                name: '7 days',
                value: '604800000'
              },
              {
                name: '30 days',
                value: '2592000000'
              },
              {
                name: '90 days',
                value: '7776000000'
              },
              {
                name: '180 days',
                value: '15552000000'
              },
              {
                name: '1 year',
                value: '31560000000'
              }
            ]
          }
        ]
      }
    )
  }

  public async execute(client: NoirClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const guild = interaction.options.getString('guild', true)
    const duration = interaction.options.getString('duration', true)

    if (!client.guilds.cache.get(guild)?.id || !(await client.guilds.fetch(guild))?.id) {
      await client.noirReply.reply({
        interaction: interaction,
        color: colors.Warning,
        author: 'Premium error',
        description: 'Guild doesn\'t exists'
      })
    }

    if (await client.noirPrisma.premium.findFirst({ where: { guild: guild } })) {
      await client.noirReply.reply({
        interaction: interaction,
        color: colors.Warning,
        author: 'Premium error',
        description: 'Guild document already exists'
      })

      return
    }

    const expirationDate = new Date(new Date().getTime() + parseInt(duration))


    await client.noirPrisma.premium.create({
      data: {
        status: true,
        guild: guild,
        expireAt: expirationDate
      }
    })

    await client.noirReply.reply({
      interaction: interaction,
      color: colors.Success,
      author: 'Premium success',
      description: `${client.guilds.cache.get(guild)?.name ?? (await client.guilds.fetch(guild)).name} got premium till <t:${expirationDate.getTime().toString().slice(0, -3)}:d>`
    })
  }
}