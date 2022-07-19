
import { Duration } from '@sapphire/time-utilities'
import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10'
import { ChatInputCommandInteraction } from 'discord.js'
import Premium from '../../../collections/Premium'
import Colors from '../../../constants/Colors'
import NoirClient from '../../../structures/Client'
import ChatCommand from '../../../structures/command/ChatCommand'

export default class PremiumCommand extends ChatCommand {
  constructor(client: NoirClient) {
    super(
      client,
      {
        permissions: ['SendMessages', 'EmbedLinks'],
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
            description: 'Premium duration',
            type: ApplicationCommandOptionType.String,
            required: true,
          }
        ]
      }
    )
  }

  public async execute(client: NoirClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const guild = interaction.options.getString('guild', true)
    const durationString = interaction.options.getString('duration', true)
    const duration = new Duration(durationString).fromNow

    try {
      if (!client.guilds.cache.get(guild)) {
        await client.reply.reply({
          interaction: interaction,
          color: Colors.warning,
          author: 'Guild error',
          description: 'Undefined provided guild Id'
        })

        return
      }

      if (client.premium.has(guild)) {
        await client.prisma.premium.updateMany({
          where: { guild: guild },
          data: { expireAt: duration, status: true }
        })

        client.premium.delete(guild)
        client.premium.set(guild, new Premium(duration, true))
      } else {
        const premium = await client.prisma.premium.findFirst({ where: { guild: guild } })

        if (!premium) {
          await client.prisma.premium.create({
            data: {
              guild: guild,
              expireAt: duration,
              status: true,
            }
          })

          client.premium.set(guild, new Premium(duration, true))
        } else {
          await client.prisma.premium.updateMany({
            where: { guild: guild },
            data: { expireAt: duration, status: true }
          })
        }
      }
    } catch (err) {
      return
    }

    const durationMs = duration.getTime().toString().slice(0, -3)

    await client.reply.reply({
      interaction: interaction,
      color: Colors.success,
      author: 'Premium success',
      description: `${client.guilds.cache.get(guild)?.name} has got premium till <d:${durationMs}:R>`
    })
  }
}