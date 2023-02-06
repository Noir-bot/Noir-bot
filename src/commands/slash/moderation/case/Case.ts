import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction } from 'discord.js'
import NoirClient from '../../../../structures/Client'
import ChatCommand from '../../../../structures/commands/ChatCommand'
import CaseEdit from './Edit'
import CaseRemove from './Remove'

export default class CaseCommand extends ChatCommand {
  constructor(client: NoirClient) {
    super(
      client,
      {
        permissions: ['SendMessages', 'EmbedLinks'],
        access: 'moderation',
        type: 'public',
        status: true
      },
      {
        name: 'case',
        description: 'Control cases',
        defaultMemberPermissions: ['ManageMessages', 'SendMessages'],
        options: [
          {
            name: 'edit',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'Edit a case',
            options: [
              {
                name: 'id',
                description: 'Case ID',
                type: ApplicationCommandOptionType.Number,
                required: true
              },
            ]
          },
          {
            name: 'remove',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'Remove a case',
            options: [
              {
                name: 'id',
                description: 'Case ID',
                type: ApplicationCommandOptionType.Number,
                required: true
              },
            ]
          }
        ],
        type: ApplicationCommandType.ChatInput,
        dmPermission: false,
      }
    )
  }

  public execute(client: NoirClient, interaction: ChatInputCommandInteraction) {
    const sub = interaction.options.getSubcommand(true)

    if (sub == 'edit') {
      CaseEdit.edit(client, interaction, interaction.options.getNumber('id', true))
    }

    else if (sub == 'remove') {
      CaseRemove.remove(client, interaction, interaction.options.getNumber('id', true))
    }
  }
}