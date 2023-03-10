import Colors from '@constants/Colors'
import Client from '@structures/Client'
import { APIActionRowComponent, APIMessageActionRowComponent, ActionRowData, AnySelectMenuInteraction, ButtonInteraction, ColorResolvable, CommandInteraction, ContextMenuCommandInteraction, EmbedBuilder, EmbedField, InteractionType, JSONEncodable, Message, MessageActionRowComponentBuilder, MessageActionRowComponentData, ModalMessageModalSubmitInteraction, ModalSubmitInteraction, Webhook } from 'discord.js'

export default class Reply {
  public static async reply(
    properties: {
      client: Client
      interaction: CommandInteraction | ContextMenuCommandInteraction | ButtonInteraction | ModalSubmitInteraction | ModalMessageModalSubmitInteraction | AnySelectMenuInteraction,
      title?: string,
      url?: string,
      author?: string,
      authorImage?: string | null,
      description?: string,
      color?: ColorResolvable,
      fields?: EmbedField[],
      footer?: string,
      footerImage?: string,
      thumbnail?: string,
      image?: string,
      content?: string,
      components?: ComponentType,
      reference?: Message,
      fetch?: boolean,
      update?: boolean,
      ephemeral?: boolean,
      timestamp?: Date | boolean,
    }) {
    const embed = this.build({
      color: properties.color,
      author: properties.author,
      title: properties.title,
      url: properties.url,
      description: properties.description,
      footer: properties.footer,
      authorImage: properties.authorImage,
      footerImage: properties.footerImage,
      thumbnail: properties.thumbnail,
      image: properties.image,
      fields: properties.fields,
      timestamp: properties.timestamp
    })

    return await this.send({
      client: properties.client,
      interaction: properties.interaction,
      content: properties.content,
      embed: embed,
      components: properties.components,
      ephemeral: properties?.ephemeral,
      fetch: properties?.fetch,
      update: properties?.update ?? true,
      reference: properties?.reference
    })
  }

  public static async sendWebhook(
    properties: {
      client: Client
      webhook: Webhook,
      title?: string,
      url?: string,
      author?: string,
      authorImage?: string,
      description?: string,
      color?: ColorResolvable,
      fields?: EmbedField[],
      footer?: string,
      footerImage?: string,
      thumbnail?: string,
      image?: string,
      content?: string,
      components?: ComponentType,
      reference?: Message,
      fetch?: boolean,
      update?: boolean,
      ephemeral?: boolean,
    }) {
    const embed = this.build({
      color: properties.color,
      author: properties.author,
      title: properties.title,
      url: properties.url,
      description: properties.description,
      footer: properties.footer,
      authorImage: properties.authorImage,
      footerImage: properties.footerImage,
      thumbnail: properties.thumbnail,
      image: properties.image,
      fields: properties.fields
    })

    return await this.send({
      client: properties.client,
      webhook: properties.webhook,
      content: properties.content,
      embed: embed,
      components: properties.components,
      ephemeral: properties?.ephemeral,
      fetch: properties?.fetch,
      update: properties?.update ?? true,
      reference: properties?.reference
    })
  }

  public static async sendMessage(
    properties: {
      client: Client
      channel: string,
      title?: string,
      url?: string,
      author?: string,
      authorImage?: string,
      description?: string,
      color?: ColorResolvable,
      fields?: EmbedField[],
      footer?: string,
      footerImage?: string,
      thumbnail?: string,
      image?: string,
      content?: string,
      components?: ComponentType,
      reference?: Message,
      fetch?: boolean,
      update?: boolean,
      ephemeral?: boolean,
    }) {
    const embed = this.build({
      color: properties.color,
      author: properties.author,
      title: properties.title,
      url: properties.url,
      description: properties.description,
      footer: properties.footer,
      authorImage: properties.authorImage,
      footerImage: properties.footerImage,
      thumbnail: properties.thumbnail,
      image: properties.image,
      fields: properties.fields
    })

    return await this.send({
      client: properties.client,
      channel: properties.channel,
      content: properties.content,
      embed: embed,
      components: properties.components,
      ephemeral: properties?.ephemeral,
      fetch: properties?.fetch,
      update: properties?.update ?? true,
      reference: properties?.reference
    })
  }

  private static async send(
    properties: {
      client: Client
      interaction?: CommandInteraction | ContextMenuCommandInteraction | ButtonInteraction | ModalSubmitInteraction | ModalMessageModalSubmitInteraction | AnySelectMenuInteraction,
      webhook?: Webhook,
      channel?: string,
      embed?: EmbedBuilder,
      components?: ComponentType,
      content?: string,
      reference?: Message,
      fetch?: boolean,
      update?: boolean,
      ephemeral?: boolean,
    }
  ) {
    if (properties.channel) {
      const channelCache = properties.client.channels.cache.get(properties.channel) ?? await properties.client.channels.fetch(properties.channel).catch((error) => { console.log(error) })

      if (channelCache?.isTextBased()) {
        return channelCache.send({
          embeds: properties.embed?.data ? [properties.embed.data] : [],
          components: properties?.components ?? [],
          content: properties?.content
        }).catch((error) => {
          console.log(error)
        })
      }
    }

    else if (properties.webhook) {
      if (properties.reference) {
        return await properties.webhook.editMessage(properties.reference, {
          embeds: properties.embed?.data ? [properties.embed.data] : [],
          components: properties?.components ?? [],
          content: properties?.content
        }).catch((error) => {
          console.log(error)
        })
      }

      else {
        return await properties.webhook.send({
          embeds: properties.embed?.data ? [properties.embed.data] : [],
          components: properties?.components ?? [],
          content: properties?.content
        }).catch((error) => {
          console.log(error)
        })
      }
    }

    else if (properties.interaction) {
      try {
        if (properties.update) {
          if (properties.interaction.isButton() || properties.interaction.isAnySelectMenu() || properties.interaction.type == InteractionType.ModalSubmit && properties.interaction.isFromMessage()) {
            return await properties.interaction.update({
              embeds: properties.embed?.data ? [properties.embed.data] : [],
              components: properties?.components ?? [],
              content: properties?.content,
              fetchReply: properties.fetch ?? false
            }).catch(async () => {
              return await properties.interaction?.editReply({
                embeds: properties.embed?.data ? [properties.embed.data] : [],
                components: properties?.components ?? [],
                content: properties?.content
              })
            })
          }

          return await properties.interaction.editReply({
            embeds: properties.embed?.data ? [properties.embed.data] : [],
            components: properties?.components ?? [],
            content: properties?.content
          })
        } else {
          return await properties.interaction.reply({
            embeds: properties.embed?.data ? [properties.embed.data] : [],
            components: properties?.components ?? [],
            content: properties?.content,
            ephemeral: properties?.ephemeral ?? true,
            fetchReply: properties.fetch ?? false
          })
        }
      } catch (err) {
        return await properties.interaction.reply({
          embeds: properties.embed?.data ? [properties.embed.data] : [],
          components: properties?.components ?? [],
          content: properties?.content,
          ephemeral: properties?.ephemeral ?? true,
          fetchReply: properties.fetch ?? false
        })
      }
    }
  }

  protected static build(
    properties: {
      title?: string,
      url?: string,
      author?: string,
      authorImage?: string | null,
      description?: string,
      fields?: EmbedField[],
      color?: ColorResolvable,
      footer?: string,
      footerImage?: string,
      thumbnail?: string
      image?: string,
      timestamp?: Date | boolean,
    }
  ): EmbedBuilder | undefined {
    const embed = new EmbedBuilder()
      .setColor(Colors.primary)

    if (properties.color) embed.setColor(properties.color)
    if (properties.author) embed.setAuthor({ name: properties.author ?? '', iconURL: properties?.authorImage ?? undefined })
    if (properties.title) embed.setTitle(properties.title ?? '')
    if (properties.url) embed.setURL(properties.url)
    if (properties.description) embed.setDescription(properties.description)
    if (properties.footer) embed.setFooter({ text: properties.footer, iconURL: properties.footerImage })
    if (properties.thumbnail) embed.setThumbnail(properties.thumbnail)
    if (properties.image) embed.setImage(properties.image)
    if (properties.fields) embed.addFields(properties.fields)
    if (properties.timestamp) embed.setTimestamp(typeof properties.timestamp == 'boolean' ? null : properties.timestamp)

    if (!properties.color && !properties.author && !properties.title && !properties.url && !properties.description && !properties.footer && !properties.thumbnail && !properties.image && !properties.fields) {
      return undefined
    }

    return embed
  }
}

type ComponentType = (
  | JSONEncodable<APIActionRowComponent<APIMessageActionRowComponent>>
  | ActionRowData<MessageActionRowComponentData | MessageActionRowComponentBuilder>
  | APIActionRowComponent<APIMessageActionRowComponent>
)[]