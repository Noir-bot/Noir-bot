import { ActionRowBuilder, EmbedBuilder, EmbedField, MessageActionRowComponentBuilder, User, Webhook } from 'discord.js'
import WelcomeMessage from '../../../../../structures/WelcomeMessage'

export default class WelcomeHelper {
  public static async send(messageData: WelcomeMessage, data: any, target: Webhook | User, actionRow?: ActionRowBuilder<MessageActionRowComponentBuilder>) {
    const embedStatus = messageData.author ?? messageData.description ?? messageData.fieldsValue.length > 0 ?? messageData.footer ?? messageData.image ?? messageData.thumbnail ?? messageData.title

    if (!embedStatus) {
      if (messageData.message) {
        await target.send({
          content: WelcomeMessage.formatVariable(messageData.message, data),
          components: actionRow ? [actionRow] : undefined
        })
      }

      return
    }

    else {
      const embed = new EmbedBuilder()

      const author = messageData.author ? WelcomeMessage.formatVariable(messageData.author, data) : undefined
      const authorImage = messageData.authorImage ?? messageData.rawAuthorImage ? WelcomeMessage.formatVariable(messageData.rawAuthorImage, data) : undefined
      const color = messageData.rawColor ? WelcomeMessage.formatColor(messageData.rawColor) : undefined
      const description = messageData.description ? WelcomeMessage.formatVariable(messageData.description, data) : undefined
      const footer = messageData.footer ? WelcomeMessage.formatVariable(messageData.footer, data) : undefined
      const footerImage = messageData.footerImage ?? messageData.rawFooterImage ? WelcomeMessage.formatVariable(messageData.rawFooterImage, data) : undefined
      const image = messageData.image ?? messageData.rawImage ? WelcomeMessage.formatVariable(messageData.rawImage, data) : undefined
      const thumbnail = messageData.thumbnail ?? messageData.rawThumbnail ? WelcomeMessage.formatVariable(messageData.rawThumbnail, data) : undefined
      const title = messageData.title ? WelcomeMessage.formatVariable(messageData.title, data) : undefined
      const url = messageData.url ? WelcomeMessage.formatVariable(messageData.url, data) : undefined

      if (author) {
        embed.setAuthor({ name: author, iconURL: authorImage })
      }

      if (color) {
        embed.setColor(color)
      }

      if (description) {
        embed.setDescription(description)
      }

      if (footer) {
        embed.setFooter({ text: footer, iconURL: footerImage })
      }

      if (image) {
        embed.setImage(image)
      }

      if (thumbnail) {
        embed.setThumbnail(thumbnail)
      }

      if (title) {
        embed.setTitle(title)
      }

      if (url) {
        embed.setURL(url)
      }

      if (messageData.fieldsId.length > 0) {
        let fields: EmbedField[] = []

        for (const index in messageData.fieldsValue) {
          const name = WelcomeMessage.formatVariable(messageData.fieldsName[index], data)
          const value = WelcomeMessage.formatVariable(messageData.fieldsValue[index], data)
          const inline = messageData.fieldsInline[index] ?? false

          if (name && value) {
            fields.push({ name: name, value: value, inline: inline })
          }
        }

        embed.addFields(fields)
      }

      target.send({
        embeds: [embed],
        content: WelcomeMessage.formatVariable(messageData.message, data),
        components: actionRow ? [actionRow] : undefined
      })
    }
  }
}