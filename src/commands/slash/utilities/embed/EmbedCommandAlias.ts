import NoirClient from '../../../../structures/Client'
import EmbedCommand from './EmbedCommand'

export default class MessageCommand extends EmbedCommand {
  constructor(client: NoirClient) {
    super(
      client
    )

    this.data.name = 'message'
  }
}