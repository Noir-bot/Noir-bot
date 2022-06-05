import {
  APIActionRowComponent,
  APIMessageActionRowComponent,
  ButtonInteraction,
  ColorResolvable,
  CommandInteraction,
  ContextMenuCommandInteraction,
  EmbedBuilder,
  EmbedField,
  JSONEncodable
} from 'discord.js'
import NoirClient from '../structures/Client'

export default class NoirReply {
  public client: NoirClient

  constructor(client: NoirClient) {
    this.client = client
  }

  public async reply(properties: {
    interaction: CommandInteraction | ContextMenuCommandInteraction | ButtonInteraction,
    components?: (APIActionRowComponent<APIMessageActionRowComponent> | JSONEncodable<APIActionRowComponent<APIMessageActionRowComponent>>)[],
    author: string,
    authorImage?: string,
    description: string,
    color: ColorResolvable,
    fields?: EmbedField[],
    footer?: string,
    footerImage?: string,
    thumbnail?: string,
    image?: string,
    content?: string,
    ephemeral?: boolean,
    fetch?: boolean
  }) {
    const embed = this.build({
      color: properties.color,
      author: properties.author,
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
      ephemeral: properties.ephemeral ?? true,
      fetch: properties.fetch ?? false
    })
  }

  protected build(
    properties: {
      author: string,
      authorImage?: string,
      description: string,
      fields?: EmbedField[],
      color: ColorResolvable,
      footer?: string,
      footerImage?: string,
      thumbnail?: string
      image?: string,
    }
  ): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setAuthor({ name: properties.author, iconURL: properties.authorImage })
      .setDescription(properties.description)
      .setColor(properties.color)

    if (properties.footer) embed.setFooter({ text: properties.footer, iconURL: properties.footerImage })
    if (properties.thumbnail) embed.setThumbnail(properties.thumbnail)
    if (properties.image) embed.setImage(properties.image)
    if (properties.fields) embed.addFields(properties.fields)

    return embed
  }

  private async send(
    properties: {
      interaction: CommandInteraction | ContextMenuCommandInteraction | ButtonInteraction,
      embed?: EmbedBuilder,
      components?: (APIActionRowComponent<APIMessageActionRowComponent> | JSONEncodable<APIActionRowComponent<APIMessageActionRowComponent>>)[],
      ephemeral: boolean,
      content?: string,
      fetch: boolean
    }
  ) {
    if (properties.interaction.isButton()) {
      return await properties.interaction.update({
        embeds: properties.embed?.data ? [properties.embed.data] : [],
        components: properties?.components ?? [],
        content: properties?.content,
        fetchReply: properties.fetch ?? false
      }).catch(async () => {
        return await properties.interaction.reply({
          embeds: properties.embed?.data ? [properties.embed.data] : [],
          components: properties?.components ?? [],
          content: properties?.content,
          ephemeral: properties?.ephemeral,
          fetchReply: properties.fetch ?? false
        })
      })
    } else if (properties.interaction.isCommand()) {
      return await properties.interaction.editReply({
        embeds: properties.embed?.data ? [properties.embed.data] : [],
        components: properties?.components ?? [],
        content: properties?.content
      }).catch(async () => {
        return await properties.interaction.reply({
          embeds: properties.embed?.data ? [properties.embed.data] : [],
          components: properties?.components ?? [],
          content: properties?.content,
          ephemeral: properties?.ephemeral,
          fetchReply: properties.fetch ?? false
        })
      })
    }
  }
}