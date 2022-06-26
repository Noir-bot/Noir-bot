import { Duration } from '@sapphire/time-utilities'
import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10'
import { ChatInputCommandInteraction } from 'discord.js'
import { colors } from '../../../libs/config/design'
import NoirClient from '../../../libs/structures/Client'
import NoirChatCommand from '../../../libs/structures/command/ChatCommand'
import NoirPremium from '../../../libs/structures/Premium'

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
        await client.noirReply.reply({
          interaction: interaction,
          color: colors.Warning,
          author: 'Server error',
          description: 'Can\'t find server by provided id'
        })

        return
      }

      if (client.noirPremiums.has(guild)) {
        await client.noirPrisma.premium.updateMany({
          where: { guild: guild },
          data: {
            expireAt: duration,
            status: true
          }
        })

        client.noirPremiums.delete(guild)
        client.noirPremiums.set(guild, new NoirPremium(guild, duration, true))
      } else {
        const premium = await client.noirPrisma.premium.findFirst({ where: { guild: guild } })

        if (!premium) {
          await client.noirPrisma.premium.create({
            data: {
              guild: guild,
              expireAt: duration,
              status: true,
            }
          })

          client.noirPremiums.set(guild, new NoirPremium(guild, duration, true))
        } else {
          await client.noirPrisma.premium.updateMany({
            where: { guild: guild },
            data: {
              expireAt: duration,
              status: true
            }
          })
        }
      }
    } catch (err) {
      console.log(err)
    }

    await client.noirReply.reply({
      interaction: interaction,
      color: colors.Success,
      author: 'Premium success',
      description: `**${client.guilds.cache.get(guild)?.name}** has got premium for \`${durationString}\``
    })
  }
}