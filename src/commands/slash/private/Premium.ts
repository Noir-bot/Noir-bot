import Colors from '@constants/Colors'
import Reply from '@helpers/Reply'
import { Duration } from '@sapphire/time-utilities'
import Client from '@structures/Client'
import Premium from '@structures/Premium'
import ChatCommand from '@structures/commands/ChatCommand'
import {AccessType,CommandType} from '@structures/commands/Command'
import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10'
import { ChatInputCommandInteraction } from 'discord.js'

export default class PremiumCommand extends ChatCommand {
  constructor(client: Client) {
    super(
      client,
      {
        permissions: [],
        access: AccessType.Private, 
        type: CommandType.Private,
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
            description: 'Premium duration',
            type: ApplicationCommandOptionType.String,
            required: true,
          }
        ]
      }
    )
  }

  public async execute(client: Client, interaction: ChatInputCommandInteraction) {
    const guild = interaction.options.getString('guild', true)
    const rawDuration = interaction.options.getString('duration', true)
    const duration = new Duration(rawDuration).fromNow

    try {
      if (!client.guilds.cache.get(guild)) {
        await Reply.reply({
          client,
          interaction: interaction,
          color: Colors.warning,
          author: 'Guild error',
          description: 'Undefined guild'
        })

        return
      }

      if (!duration.getUTCDate()) {
        await Reply.reply({
          client,
          interaction: interaction,
          color: Colors.warning,
          author: 'Duration error',
          description: 'Invalid duration'
        })

        return
      }

      if (client.premium.has(guild)) {
        await client.prisma.premium.updateMany({
          where: { guild: guild },
          data: { expires: duration }
        })

        client.premium.delete(guild)
        client.premium.set(guild, new Premium(guild, duration))
      }

      else {
        const premium = await client.prisma.premium.findFirst({ where: { guild: guild } })

        if (!premium) {
          await client.prisma.premium.create({
            data: {
              guild: guild,
              expires: duration
            }
          })
        }

        else {
          await client.prisma.premium.updateMany({
            where: { guild: guild },
            data: { expires: duration }
          })
        }

        client.premium.set(guild, new Premium(guild, duration))
      }
    } catch (err) {
      return
    }

    const durationMs = duration.getTime().toString().slice(0, -3)

    await Premium.cache(client, guild)

    await Reply.reply({
      client,
      interaction: interaction,
      color: Colors.primary,
      author: 'Premium success',
      description: `${client.guilds.cache.get(guild)?.name} has got premium util <t:${durationMs}:R>`
    })
  }
}
