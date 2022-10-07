import { ColorResolvable, EmbedBuilder, Guild, GuildMember } from 'discord.js'
import WelcomeCollection, { WelcomeCollectionMessageData } from '../../commands/slash/utilities/settings/collections/WelcomeCollection'
import { WelcomeMessageType } from '../../constants/Options'
import NoirClient from '../../structures/Client'

export default class UserUtils {
  public static buildMessage(client: NoirClient, member: GuildMember, data: WelcomeCollection['data']['messages'], type: WelcomeMessageType): { embeds?: EmbedBuilder[], content?: string } | undefined {
    const messageBuild: WelcomeCollectionMessageData = { embed: { timestamp: false, fields: [] } }
    let messageData

    if (type == 'guild_join') messageData = data.guild.join
    else if (type == 'guild_left') messageData = data.guild.left
    else messageData = data.direct.join

    if (!messageData) return

    if (messageData.message) messageBuild.message = this.formatValue(client, messageData.message, { member: member, guild: member.guild })
    if (messageData.embed.author) messageBuild.embed.author = this.formatValue(client, messageData.embed.author, { member: member, guild: member.guild })
    if (messageData.embed.rawAuthorImage) messageBuild.embed.authorImage = this.formatImage(client, messageData.embed.rawAuthorImage, { member: member, guild: member.guild })
    if (messageData.embed.color) messageBuild.embed.color = client.utils.formatColor(messageData.embed.color)
    if (messageData.embed.description) messageBuild.embed.description = this.formatValue(client, messageData.embed.description, { member: member, guild: member.guild })
    if (messageData.embed.footer) messageBuild.embed.footer = this.formatValue(client, messageData.embed.footer, { member: member, guild: member.guild })
    if (messageData.embed.rawFooterImage) messageBuild.embed.footerImage = this.formatImage(client, messageData.embed.rawFooterImage, { member: member, guild: member.guild })
    if (messageData.embed.rawImage) messageBuild.embed.image = this.formatImage(client, messageData.embed.rawImage, { member: member, guild: member.guild })
    if (messageData.embed.rawThumbnail) messageBuild.embed.thumbnail = this.formatImage(client, messageData.embed.rawThumbnail, { member: member, guild: member.guild })
    if (messageData.embed.timestamp) messageBuild.embed.timestamp = messageData.embed.timestamp
    if (messageData.embed.title) messageBuild.embed.title = this.formatValue(client, messageData.embed.title, { member: member, guild: member.guild })
    if (messageData.embed.url) messageBuild.embed.url = this.formatValue(client, messageData.embed.url, { member: member, guild: member.guild })

    messageBuild.embed.fields.map(field => {
      messageBuild.embed.fields.push({
        id: field.id,
        name: this.formatValue(client, field.name, { member: member, guild: member.guild }) ?? field.name,
        value: this.formatValue(client, field.value, { member: member, guild: member.guild }) ?? field.value,
        inline: field.inline
      })
    })

    const embed = new EmbedBuilder()
    let embedStatus = false

    if (messageBuild?.embed.author) {
      embed.setAuthor({ name: messageBuild?.embed.author, iconURL: messageBuild?.embed.authorImage })
      embedStatus = true
    }

    if (messageBuild?.embed.color) {
      embed.setColor(messageBuild?.embed.color as ColorResolvable)
    }

    if (messageBuild?.embed.description) {
      embed.setDescription(messageBuild?.embed.description)
      embedStatus = true
    }

    if (messageBuild?.embed.footer) {
      embed.setFooter({ text: messageBuild?.embed.footer, iconURL: messageBuild?.embed.footerImage })
      embedStatus = true
    }

    if (messageBuild?.embed.image) {
      embed.setImage(messageBuild?.embed.image)
      embedStatus = true
    }

    if (messageBuild?.embed.thumbnail) {
      embed.setThumbnail(messageBuild?.embed.thumbnail)
      embedStatus = true
    }

    if (messageBuild?.embed.timestamp) {
      embed.setTimestamp()
    }

    if (messageBuild?.embed.title) {
      embed.setTitle(messageBuild.embed.title)
      embedStatus = true
    }

    if (messageBuild?.embed.url) {
      embed.setURL(messageBuild.embed.url)
    }

    if (messageBuild.embed.fields) {
      messageBuild.embed.fields.map(field => {
        embed.addFields({
          name: field.name,
          value: field.value,
          inline: field.inline
        })
      })
      embedStatus = true
    }

    return {
      embeds: embedStatus ? [embed] : undefined,
      content: messageBuild.message ?? undefined
    }
  }

  public static formatValue(client: NoirClient, value: string, properties?: { guild?: Guild, member?: GuildMember }) {
    let result: string | undefined | null = client.utils.removeFormatValue(value)

    result?.replace(/\{\{client name\}\}/g, client.user?.username ?? '')
      .replace(/\{\{client avatar\}\}/g, client.user?.avatarURL() ?? '')

    if (properties?.member) {
      result = result?.replace(/\{\{user name\}\}/g, properties.member.user.username)
        .replace(/\{\{user avatar\}\}/g, properties.member.avatarURL() ?? '')
        .replace(/\{\{user id\}\}/g, properties.member.id)
        .replace(/\{\{user joinedAt\}\}/g, `<t:${properties.member.joinedAt?.getTime().toString().slice(0, -3)}:R>`)
        .replace(/\{\{user joined\}\}/g, `<t:${properties.member.joinedAt?.getTime().toString().slice(0, -3)}:d>`)
        .replace(/\{\{user createdAt\}\}/g, `<t:${properties.member.user.createdAt?.getTime().toString().slice(0, -3)}:R>`)
        .replace(/\{\{user created\}\}/g, `<t:${properties.member.user.createdAt?.getTime().toString().slice(0, -3)}:d>`)
    }

    if (properties?.guild) {
      result = result?.replace(/\{\{guild name\}\}/g, properties.guild.name)
        .replace(/\{\{guild icon\}\}/g, properties.guild.iconURL() ?? '')
        .replace(/\{\{guild members\}\}/g, properties.guild.memberCount.toString())
        .replace(/\{\{guild createdAt\}\}/g, `<t:${properties.guild.createdAt?.getTime().toString().slice(0, -3)}:R>`)
        .replace(/\{\{guild created\}\}/g, `<t:${properties.guild.createdAt?.getTime().toString().slice(0, -3)}:d>`)
    }

    return result
  }

  public static formatImage(client: NoirClient, value: string, properties?: { guild?: Guild, member?: GuildMember }) {
    let result: string | undefined | null = client.utils.removeFormatValue(value)

    result?.replace(/\{\{client avatar\}\}/g, client.user?.avatarURL() ?? '')

    if (properties?.member) {
      result = result?.replace(/\{\{user avatar\}\}/g, properties.member.avatarURL() ?? '')
    }

    if (properties?.guild) {
      result = result?.replace(/\{\{guild icon\}\}/g, properties.guild.iconURL() ?? '')
    }

    return result
  }
}