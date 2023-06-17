import Reply from '@helpers/Reply'
import Client from '@structures/Client'
import ChatCommand from '@structures/commands/ChatCommand'
import { AccessType, CommandCategory, CommandType } from '@structures/commands/Command'
import ModerationRules, { ModerationRule } from '@structures/moderation/ModerationRules'
import { ApplicationCommandType, ChatInputCommandInteraction } from 'discord.js'

export default class Reset extends ChatCommand {
  constructor(client: Client) {
    super(
      client,
      {
        permissions: ['SendMessages'],
        category: CommandCategory.Private,
        access: AccessType.Private,
        type: CommandType.Private,
        status: true
      },
      {
        name: 'test',
        description: 'This command changes constantly depending on what is currently being developed',
        defaultMemberPermissions: ['Administrator'],
        type: ApplicationCommandType.ChatInput,
      }
    )
  }

  public async execute(client: Client, interaction: ChatInputCommandInteraction<'cached'>) {
    const cache = await ModerationRules.cache(client, interaction.guildId!, false, true)

    if (cache) {
      cache.rules[0].action = 'updated'
      cache.rules.pop()
      cache.rules.push({
        guild: 'server',
        action: 'added',
        quantity: 1,
        duration: '19m'
      } as ModerationRule)
    }

    await ModerationRules.save(client, interaction.guildId!)

    Reply.reply({
      client,
      interaction,
      content: 'Completed! Check the console for the results.'
    })
  }
}