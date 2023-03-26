import Colors from '@constants/Colors'
import Reply from '@helpers/Reply'
import Client from '@structures/Client'
import ChatCommand from '@structures/commands/ChatCommand'
import { AccessType, CommandType } from '@structures/commands/Command'
import { ActionRowBuilder, ApplicationCommandType, ChatInputCommandInteraction, MessageActionRowComponentBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction } from 'discord.js'

export default class RulesCommand extends ChatCommand {
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
        name: 'rules',
        description: 'Send server rules',
        type: ApplicationCommandType.ChatInput,
        defaultMemberPermissions: 'Administrator',
        dmPermission: false
      }
    )
  }

  public static image = [
    'https://i.imgur.com/wZX8XWS.png',
    'https://i.imgur.com/nRkyQU0.png',
    'https://i.imgur.com/D2adSR1.png'
  ]
  public static title = ['Community rules', 'Правила сообщества', 'Սերվերի կանոնները']
  public static fields = [
    [
      {
        name: 'Attitude',
        value: `Please be polite and respectful towards people in the server. Don't be rude or mean to anyone.`,
        inline: false
      },
      {
        name: 'Forbidden topics',
        value: 'Prohibited topics, such as politics, religion, discrimination, or other sensitive content, are strictly off-limits in the server.',
        inline: false
      },
      {
        name: 'Advertisement',
        value: 'Please refrain from promoting other Discord servers, websites, or products without permission from the server moderators. Spamming or excessive self-promotion is not allowed.',
        inline: false
      },
      {
        name: 'Offensive content',
        value: 'Please do not share any inappropriate or offensive content, including sexually explicit images or videos.',
        inline: false
      },
      {
        name: 'Moderation',
        value: 'If the server moderators find that a member has violated any of these rules they may take corresponding action.',
        inline: false
      }
    ],
    [
      {
        name: 'Отношение',
        value: 'Пожалуйста, будьте вежливы и уважительны к людям на сервере. Не будь грубым или злым ни с кем',
        inline: false
      },
      {
        name: 'Запрещенный контент',
        value: 'Заповедные темы, такие как политика, религия, дискриминация или другой чувствительный контент, строго запрещены на сервере.',
        inline: false
      },
      {
        name: 'Реклама',
        value: 'Пожалуйста, воздержитесь от рекламы других серверов, веб-сайтов или продуктов без разрешения модераторов сервера. Спам или чрезмерная самореклама запрещены.',
        inline: false
      },
      {
        name: 'Оскорбительный контент',
        value: 'Пожалуйста, не делитесь неприемлемым или оскорбительным контентом, включая изображения или видео сексуального характера.',
        inline: false
      },
      {
        name: 'Модерация',
        value: 'Если модераторы сервера обнаружат, что участник нарушил какое-либо из этих правил или совершил поведение, наносящее ущерб сообществу сервера, они могут принять меры по своему усмотрению.',
        inline: false
      }
    ],
    [
      {
        name: 'Վերաբերմունք',
        value: 'Խնդրում ենք լինել քաղաքավարի և հարգալից սերվերի անդամների նկատմամբ: Մի եղեք կոպիտ կամ չար ոչ ոքի նկատմամբ։',
        inline: false
      },
      {
        name: 'Արգելված բովանդակություն',
        value: 'Արգելված է քննարկել թեմաներ, ինչպիսիք են քաղաքականությունը, կրոնը, խտրականությունը կամ այլ զգայուն բովանդակություն պարունակող խոսակցություններ:',
        inline: false
      },
      {
        name: 'Գովազդ',
        value: 'Խնդրում ենք զերծ մնալ այլ սերվերների, կայքերի կամ ապրանքների գովազդից՝ առանց սերվերի մոդերատորների թույլտվության: Սպամը կամ ավելորդ ինքնագովազդումն արգելված է:',
        inline: false
      },
      {
        name: 'Վիրավորական բովանդակություն',
        value: 'Խնդրում ենք մի տարածեք անպատշաճ, վիրավորական բովանդակության կամ սեռական բնույթի նյութեր, պատկերներ կամ տեսանյութեր:',
        inline: false
      },
      {
        name: 'Մոդերացիյա',
        value: 'Եթե ​​սերվերի մոդերատորները գտնում են, որ անդամը խախտել է այս կանոններից որևէ մեկը կամ վարքագիծ է դրսևորել, որը վնասակար է սերվերի համայնքին, նրանք կարող են իրենց հայեցողությամբ միջոցներ ձեռնարկել:',
        inline: false
      }
    ]
  ]

  public execute(client: Client, interaction: ChatInputCommandInteraction<'cached'>) {
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('rules')
      .setPlaceholder('Select a language')
      .setMaxValues(1)
      .setMinValues(1)
      .setOptions([
        {
          label: 'English',
          value: 'gb',
          description: 'Translate to English',
          emoji: '🇬🇧',
          default: true
        },
        {
          label: 'Russian',
          value: 'ru',
          description: 'Translate to Russian',
          emoji: '🇷🇺'
        },
        {
          label: 'Armenian',
          value: 'am',
          description: 'Translate to Armenian',
          emoji: '🇦🇲'
        }
      ])

    const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(selectMenu)

    Reply.sendMessage({
      client,
      color: Colors.primary,
      channel: interaction.channel?.id || '',
      fields: RulesCommand.fields[0],
      title: RulesCommand.title[0],
      image: RulesCommand.image[0],
      components: [actionRow],
    })

    Reply.reply({
      client,
      interaction,
      content: 'Successfully sent the rules',
    })
  }

  public static select(client: Client, interaction: StringSelectMenuInteraction<'cached'>) {
    const index = ['gb', 'ru', 'am'].indexOf(interaction.values[0])

    Reply.reply({
      client,
      interaction,
      color: Colors.primary,
      fields: RulesCommand.fields[index],
      title: RulesCommand.title[index],
      image: RulesCommand.image[index],
      ephemeral: true,
      update: false
    })
  }
}