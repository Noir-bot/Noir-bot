import { APIActionRowComponent, APIMessageActionRowComponent, ButtonInteraction, ColorResolvable, CommandInteraction, ContextMenuCommandInteraction, EmbedBuilder, EmbedField, InteractionType, JSONEncodable, ModalMessageModalSubmitInteraction, ModalSubmitInteraction, SelectMenuInteraction } from 'discord.js'
import Colors from '../constants/Colors'
import NoirClient from '../structures/Client'

export default class Reply {
  public client: NoirClient

  constructor(client: NoirClient) {
    this.client = client
  }

  public async reply(properties: {
    interaction: CommandInteraction | ContextMenuCommandInteraction | ButtonInteraction | ModalSubmitInteraction | SelectMenuInteraction,
    components?: (APIActionRowComponent<APIMessageActionRowComponent> | JSONEncodable<APIActionRowComponent<APIMessageActionRowComponent>>)[],
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
    ephemeral?: boolean,
    fetch?: boolean,
    update?: boolean
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
      interaction: properties.interaction,
      content: properties.content,
      embed: embed,
      components: properties.components,
      ephemeral: properties?.ephemeral,
      fetch: properties?.fetch,
      update: properties?.update ?? true
    })
  }

  protected build(
    properties: {
      title?: string,
      url?: string,
      author?: string,
      authorImage?: string,
      description?: string,
      fields?: EmbedField[],
      color?: ColorResolvable,
      footer?: string,
      footerImage?: string,
      thumbnail?: string
      image?: string,
    }
  ): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor(Colors.secondary)

    if (properties.color) embed.setColor(properties.color)
    if (properties.author) embed.setAuthor({ name: properties.author ?? '', iconURL: properties.authorImage })
    if (properties.title) embed.setTitle(properties.title ?? '')
    if (properties.url) embed.setURL(properties.url)
    if (properties.description) embed.setDescription(properties.description)
    if (properties.footer) embed.setFooter({ text: properties.footer, iconURL: properties.footerImage })
    if (properties.thumbnail) embed.setThumbnail(properties.thumbnail)
    if (properties.image) embed.setImage(properties.image)
    if (properties.fields) embed.addFields(properties.fields)

    return embed
  }

  private async send(
    properties: {
      interaction: CommandInteraction | ContextMenuCommandInteraction | ButtonInteraction | SelectMenuInteraction | ModalSubmitInteraction | ModalMessageModalSubmitInteraction,
      embed?: EmbedBuilder,
      components?: (APIActionRowComponent<APIMessageActionRowComponent> | JSONEncodable<APIActionRowComponent<APIMessageActionRowComponent>>)[],
      ephemeral?: boolean,
      content?: string,
      fetch?: boolean,
      update?: boolean
    }
  ) {
    try {
      if (properties.update) {
        if (properties.interaction.isButton() || properties.interaction.isSelectMenu() || properties.interaction.type == InteractionType.ModalSubmit && properties.interaction.isFromMessage()) {
          return await properties.interaction.update({
            embeds: properties.embed?.data ? [properties.embed.data] : [],
            components: properties?.components ?? [],
            content: properties?.content,
            fetchReply: properties.fetch ?? false
          }).catch(async () => {
            return await properties.interaction.editReply({
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