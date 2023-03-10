import CaseEdit from '@commands/slash/moderation/case/Edit'
import CaseRemove from '@commands/slash/moderation/case/Remove'
import Client from '@structures/Client'
import ChatCommand from '@structures/commands/ChatCommand'
import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction } from 'discord.js'

export default class CaseCommand extends ChatCommand {
  constructor(client: Client) {
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

  public execute(client: Client, interaction: ChatInputCommandInteraction) {
    const sub = interaction.options.getSubcommand(true)

    if (sub == 'edit') {
      CaseEdit.edit(client, interaction, interaction.options.getNumber('id', true))
    }

    else if (sub == 'remove') {
      CaseRemove.remove(client, interaction, interaction.options.getNumber('id', true))
    }
  }
}