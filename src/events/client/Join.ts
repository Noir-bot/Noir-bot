import Colors from "@constants/Colors"
import Options from "@constants/Options"
import Client from "@structures/Client"
import Event from "@structures/Event"
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, Guild, MessageActionRowComponentBuilder } from 'discord.js'
import Reply from '../../helpers/Reply'

export default class ReadyEvent extends Event {
  constructor(client: Client) {
    super(client, 'guildCreate', true)
  }

  public execute(client: Client, guild: Guild): void {
    const channel = guild.systemChannel ?? guild.channels.cache.first()

    if (!channel || channel.type != ChannelType.GuildText) return

    const buttons = [
      new ButtonBuilder()
        .setLabel('Documentation')
        .setStyle(ButtonStyle.Link)
        .setURL(Options.docsLink),
      new ButtonBuilder()
        .setLabel('Support server')
        .setStyle(ButtonStyle.Link)
        .setURL(Options.guildInvite),
    ]

    const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(buttons)

    Reply.sendMessage({
      client,
      channel: channel.id,
      color: Colors.primary,
      footer: `Made with 💚 by ${client.users.cache.get(Options.owners[0])?.tag}`,
      author: 'Noir',
      thumbnail: client.user?.displayAvatarURL(),
      description: 'Hello there, I am Noir an advanced moderation and utility bot designed to provide unparalleled user experience and simplicity.\n\nWhether you’re looking for a powerful way to manage your server or a simple way to stay connected with your friends, Noir has the perfect solution for you.',
      components: [actionRow]
    })
  }
}