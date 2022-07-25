import { WelcomeMessageData, WelcomeMessageEmbedFieldData } from '@prisma/client'
import { ColorResolvable, EmbedBuilder, Interaction } from 'discord.js'
import Colors from '../../../../../constants/Colors'
import Options from '../../../../../constants/Options'
import Patterns from '../../../../../constants/Patterns'
import NoirClient from '../../../../../structures/Client'

export default class SettingsCommandWelcomeMessage {
  public static modifyValue(value?: string | null): string | undefined | null {
    return value ? value == Options.removeValue ? undefined : value : undefined
  }

  public static modifyImage(interaction: Interaction, image?: string | null): string | undefined {
    if (image) {
      if (Patterns.url.test(image)) {
        return image
      }

      image = image.toLowerCase()

      if (image == 'client') {
        return Options.clientAvatar
      }

      else if (image == 'server') {
        const guildIcon = interaction.guild?.iconURL()

        if (guildIcon) {
          return guildIcon
        }
      }

      else if (image == 'user') {
        const userAvatar = interaction.user.avatarURL()

        if (userAvatar) {
          return userAvatar
        }
      }
    }

    return undefined
  }

  public static modifyColor(color?: string | null): string | undefined {
    if (color) {
      if (Patterns.color.test(color)) {
        return color
      }

      color = color.toLowerCase()

      if (color == 'green') {
        return Colors.primaryHex
      }

      else if (color == 'gray') {
        return Colors.secondaryHex
      }

      else if (color == 'yellow') {
        return Colors.tertiaryHex
      }

      else if (color == 'cyan') {
        return Colors.successHex
      }

      else if (color == 'red') {
        return Colors.warningHex
      }

      else if (color == 'embed') {
        return Colors.embedHex
      }
    }

    return undefined
  }

  public static modifyBoolean(boolean?: string | null): boolean {
    return boolean?.toLowerCase() == 'true' ? true : false
  }

  public static build(client: NoirClient, interaction: Interaction, type: string): EmbedBuilder | undefined {
    const embed = new EmbedBuilder()
    const guildId = interaction.guild?.id

    if (!guildId) return

    const premiumStatus = guildId ? client.premium.get(guildId)?.status : false
    let data: WelcomeMessageData | undefined

    if (type == 'GuildJoin') data = client.welcomeSettings.get(guildId)?.data.messages.guild.join
    else if (type == 'GuildLeft') data = client.welcomeSettings.get(guildId)?.data.messages.guild.leave
    else if (type == 'DirectJoin') data = client.welcomeSettings.get(guildId)?.data.messages.direct.join

    if (data?.embed.timestamp) {
      embed.setTimestamp()
    }

    const embedFields = data?.embed.fields
    const embedColor = this.modifyColor(data?.embed.color)
    const embedDescription = this.modifyValue(data?.embed.description)
    const embedAuthor = this.modifyValue(data?.embed.author)
    const embedFooter = this.modifyValue(data?.embed.footer)
    const embedTitle = this.modifyValue(data?.embed.title)
    const embedURL = this.modifyValue(data?.embed.url)

    const embedAuthorImage = this.modifyImage(interaction, data?.embed.authorImage)
    const embedFooterImage = this.modifyImage(interaction, data?.embed.footerImage)
    const embedImage = this.modifyImage(interaction, data?.embed.image)
    const embedThumbnail = this.modifyImage(interaction, data?.embed.thumbnail)

    if (embedColor) {
      embed.setColor(embedColor as ColorResolvable)
    }

    if (embedDescription) {
      embed.setDescription(embedDescription)
    }

    if (embedAuthor) {
      embed.setAuthor({ name: embedAuthor, iconURL: embedAuthorImage })
    }

    if (embedFooter) {
      embed.setFooter({ text: embedFooter, iconURL: embedFooterImage })
    }

    if (embedTitle) {
      embed.setTitle(embedTitle)
    }

    if (embedURL) {
      embed.setURL(embedURL)
    }

    if (embedImage) {
      embed.setImage(embedImage)
    }

    if (embedThumbnail) {
      embed.setThumbnail(embedThumbnail)
    }

    if (embedFields && premiumStatus) {
      embedFields.map(field => {
        embed.addFields([field])
      })
    }

    return embed
  }

  public static setMessage(client: NoirClient, interaction: Interaction, type: string, message: string): void {
    const guildId = interaction.guild?.id
    let data: WelcomeMessageData | undefined

    if (!guildId) return

    if (type == 'GuildJoin') data = client.welcomeSettings.get(guildId)?.data.messages.guild.join
    else if (type == 'GuildLeft') data = client.welcomeSettings.get(guildId)?.data.messages.guild.leave
    else if (type == 'DirectJoin') data = client.welcomeSettings.get(guildId)?.data.messages.direct.join

    if (!data) return

    data.message = message
  }

  public static setEmbedURL(client: NoirClient, interaction: Interaction, type: string, url: string): void {
    const guildId = interaction.guild?.id
    let data: WelcomeMessageData | undefined

    if (!guildId) return

    if (type == 'GuildJoin') data = client.welcomeSettings.get(guildId)?.data.messages.guild.join
    else if (type == 'GuildLeft') data = client.welcomeSettings.get(guildId)?.data.messages.guild.leave
    else if (type == 'DirectJoin') data = client.welcomeSettings.get(guildId)?.data.messages.direct.join

    if (!data) return

    data.embed.url = url
  }

  public static setEmbedColor(client: NoirClient, interaction: Interaction, type: string, color: string): void {
    const guildId = interaction.guild?.id
    let data: WelcomeMessageData | undefined

    if (!guildId) return

    if (type == 'GuildJoin') data = client.welcomeSettings.get(guildId)?.data.messages.guild.join
    else if (type == 'GuildLeft') data = client.welcomeSettings.get(guildId)?.data.messages.guild.leave
    else if (type == 'DirectJoin') data = client.welcomeSettings.get(guildId)?.data.messages.direct.join

    if (!data) return

    data.embed.color = color
  }

  public static setEmbedDescription(client: NoirClient, interaction: Interaction, type: string, description: string): void {
    const guildId = interaction.guild?.id
    let data: WelcomeMessageData | undefined

    if (!guildId) return

    if (type == 'GuildJoin') data = client.welcomeSettings.get(guildId)?.data.messages.guild.join
    else if (type == 'GuildLeft') data = client.welcomeSettings.get(guildId)?.data.messages.guild.leave
    else if (type == 'DirectJoin') data = client.welcomeSettings.get(guildId)?.data.messages.direct.join

    if (!data) return

    data.embed.description = description
    data.embed.status = true
  }

  public static setEmbedTitle(client: NoirClient, interaction: Interaction, type: string, title: string): void {
    const guildId = interaction.guild?.id
    let data: WelcomeMessageData | undefined

    if (!guildId) return

    if (type == 'GuildJoin') data = client.welcomeSettings.get(guildId)?.data.messages.guild.join
    else if (type == 'GuildLeft') data = client.welcomeSettings.get(guildId)?.data.messages.guild.leave
    else if (type == 'DirectJoin') data = client.welcomeSettings.get(guildId)?.data.messages.direct.join

    if (!data) return

    data.embed.title = title
  }

  public static setEmbedAuthor(client: NoirClient, interaction: Interaction, type: string, author: string, image?: string): void {
    const guildId = interaction.guild?.id
    let data: WelcomeMessageData | undefined

    if (!guildId) return

    if (type == 'GuildJoin') data = client.welcomeSettings.get(guildId)?.data.messages.guild.join
    else if (type == 'GuildLeft') data = client.welcomeSettings.get(guildId)?.data.messages.guild.leave
    else if (type == 'DirectJoin') data = client.welcomeSettings.get(guildId)?.data.messages.direct.join

    if (!data) return

    data.embed.author = author
    data.embed.authorImage = image
  }

  public static setEmbedImage(client: NoirClient, interaction: Interaction, type: string, image: string): void {
    const guildId = interaction.guild?.id
    let data: WelcomeMessageData | undefined

    if (!guildId) return

    if (type == 'GuildJoin') data = client.welcomeSettings.get(guildId)?.data.messages.guild.join
    else if (type == 'GuildLeft') data = client.welcomeSettings.get(guildId)?.data.messages.guild.leave
    else if (type == 'DirectJoin') data = client.welcomeSettings.get(guildId)?.data.messages.direct.join

    if (!data) return

    data.embed.image = image
    data.embed.status = true
  }

  public static setEmbedThumbnail(client: NoirClient, interaction: Interaction, type: string, thumbnail: string): void {
    const guildId = interaction.guild?.id
    let data: WelcomeMessageData | undefined

    if (!guildId) return

    if (type == 'GuildJoin') data = client.welcomeSettings.get(guildId)?.data.messages.guild.join
    else if (type == 'GuildLeft') data = client.welcomeSettings.get(guildId)?.data.messages.guild.leave
    else if (type == 'DirectJoin') data = client.welcomeSettings.get(guildId)?.data.messages.direct.join

    if (!data) return

    data.embed.thumbnail = thumbnail
    data.embed.status = true
  }

  public static setEmbedFooter(client: NoirClient, interaction: Interaction, type: string, footer: string, image?: string): void {
    const guildId = interaction.guild?.id
    let data: WelcomeMessageData | undefined

    if (!guildId) return

    if (type == 'GuildJoin') data = client.welcomeSettings.get(guildId)?.data.messages.guild.join
    else if (type == 'GuildLeft') data = client.welcomeSettings.get(guildId)?.data.messages.guild.leave
    else if (type == 'DirectJoin') data = client.welcomeSettings.get(guildId)?.data.messages.direct.join

    if (!data) return

    data?.embed.footer = footer
    data?.embed.footerImage = image
  }

  public static setEmbedTimestamp(client: NoirClient, interaction: Interaction, type: string, status: string): void {
    const guildId = interaction.guild?.id
    let data: WelcomeMessageData | undefined

    if (!guildId) return

    if (type == 'GuildJoin') data = client.welcomeSettings.get(guildId)?.data.messages.guild.join
    else if (type == 'GuildLeft') data = client.welcomeSettings.get(guildId)?.data.messages.guild.leave
    else if (type == 'DirectJoin') data = client.welcomeSettings.get(guildId)?.data.messages.direct.join

    if (!data) return

    data?.embed.timestamp = this.modifyBoolean(status)
    data?.embed.status = true
  }

  public static addEmbedField(client: NoirClient, interaction: Interaction, type: string, field: MessageEmbedField): void {
    const guildId = interaction.guild?.id
    let data: WelcomeMessageData | undefined

    if (!guildId) return

    if (type == 'GuildJoin') data = client.welcomeSettings.get(guildId)?.data.messages.guild.join
    else if (type == 'GuildLeft') data = client.welcomeSettings.get(guildId)?.data.messages.guild.leave
    else if (type == 'DirectJoin') data = client.welcomeSettings.get(guildId)?.data.messages.direct.join

    if (!data) return

    if (data?.embed.fields?.size < Options.embedFieldsLimit) {
      data?.embed.fields?.set(field.id, field)
    }
  }

  public static editEmbedField(client: NoirClient, interaction: Interaction, type: string, field: WelcomeMessageEmbedFieldData): void {
    const guildId = interaction.guild?.id
    let data: WelcomeMessageData | undefined

    if (!guildId) return

    if (type == 'GuildJoin') data = client.welcomeSettings.get(guildId)?.data.messages.guild.join
    else if (type == 'GuildLeft') data = client.welcomeSettings.get(guildId)?.data.messages.guild.leave
    else if (type == 'DirectJoin') data = client.welcomeSettings.get(guildId)?.data.messages.direct.join

    if (!data) return

    if (data?.embed.fields?.size > 0) {
      data?.embed.fields.delete(field.id)
      data?.embed.fields.set(field.id, field)
    }
  }

  public static removeEmbedField(client: NoirClient, interaction: Interaction, type: string, id: number): void {
    const guildId = interaction.guild?.id
    let data: WelcomeMessageData | undefined

    if (!guildId) return

    if (type == 'GuildJoin') data = client.welcomeSettings.get(guildId)?.data.messages.guild.join
    else if (type == 'GuildLeft') data = client.welcomeSettings.get(guildId)?.data.messages.guild.leave
    else if (type == 'DirectJoin') data = client.welcomeSettings.get(guildId)?.data.messages.direct.join

    if (!data) return

    if (data?.embed.fields.length > 0) {
      data?.embed.fields.delete(id)
    }

    return this
  }
}