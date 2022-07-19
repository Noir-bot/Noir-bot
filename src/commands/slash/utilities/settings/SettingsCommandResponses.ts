import { ButtonInteraction, ModalMessageModalSubmitInteraction } from 'discord.js'
import NoirClient from '../../../../structures/Client'
import SettingsCommand from './SettingsCommand'
import SettingsWelcome from './SettingsCommandWelcome'

export default class SettingsCommandResponse {
  public static async button(client: NoirClient, interaction: ButtonInteraction): Promise<void> {
    const parts = interaction.customId.split('-')
    const method = parts[2]
    const id = parts[1]

    if (method == 'initial') SettingsCommand.initialMessage(client, interaction, id)

    // else if (method == 'welcome') {
    //   await SettingsWelcome.initialMessage(client, interaction, id)
    // }

    // else if (method == 'welcomeBack') {
    //   await SettingsCommand.initialMessage(client, interaction, id)
    // }

    // else if (method == 'welcomeSave') {
    //   await client.welcomeSettings.get(id)?.cache(client)
    //   await SettingsWelcome.initialMessage(client, interaction, id)
    // }

    // else if (method == 'welcomeReset') {
    //   await client.welcomeSettings.get(id)?.send(client)
    //   await SettingsWelcome.initialMessage(client, interaction, id)
    // }

    // else if (method == 'welcomeStatus') {
    //   const welcomeData = client.welcomeSettings.get(id)!.data
    //   welcomeData.status = !welcomeData.status
    //   await SettingsWelcome.initialMessage(client, interaction, id)
    // }

    // else if (method == 'welcomeChannel') {
    //   await SettingsWelcome.channelRequest(client, interaction, id)
    // }

    // else if (method == 'welcomeMessages') {
    //   await SettingsWelcome.messagesMessage(client, interaction, id)
    // }

    // else if (method == 'welcomeMessagesBack') {
    //   await SettingsWelcome.initialMessage(client, interaction, id)
    // }

    // else if (method == 'welcomeMessagesSave') {
    //   await client.welcomeSettings.get(id)?.cache(client)
    //   await SettingsWelcome.messagesMessage(client, interaction, id)
    // }

    // else if (method == 'welcomeMessagesReset') {
    //   await client.welcomeSettings.get(id)?.send(client)
    //   await SettingsWelcome.messagesMessage(client, interaction, id)
    // }

    // else if (method == 'welcomeMessagesGuildStatus') {
    //   const welcomeData = client.welcomeSettings.get(id)!.data
    //   welcomeData.messages.guild.status = !welcomeData.messages?.guild?.status ?? true
    //   await SettingsWelcome.messagesMessage(client, interaction, id)
    // }

    // else if (method == 'welcomeMessagesDirectStatus') {
    //   const welcomeData = client.welcomeSettings.get(id)!.data
    //   welcomeData.messages.direct.status = !welcomeData.messages.direct.status
    //   await SettingsWelcome.messagesMessage(client, interaction, id)
    // }

    // else if (method.startsWith('welcomeMessagesEditorBack')) {
    //   await SettingsWelcome.messagesMessage(client, interaction, id)
    // }

    // else if (method.startsWith('welcomeMessagesEditorSave')) {
    //   const type = method.split('.')[1]
    //   await client.welcomeSettings.get(id)?.cache(client)
    //   await SettingsWelcome.messageEditorMessage(client, interaction, id, type)
    // }

    // else if (method.startsWith('welcomeMessagesEditorReset')) {
    //   const type = method.split('.')[1]
    //   await client.welcomeSettings.get(id)?.send(client)
    //   await SettingsWelcome.messageEditorMessage(client, interaction, id, type)
    // }

    // else if (method.startsWith('welcomeMessagesEditor')) {
    //   const type = method.split('.')[1]
    //   await SettingsWelcome.messageEditorMessage(client, interaction, id, type)
    // }
  }

  public static async modal(client: NoirClient, interaction: ModalMessageModalSubmitInteraction): Promise<void> {
    const parts = interaction.customId.split('-')
    const method = parts[2]
    const id = parts[1]

    if (method == 'welcomeChannel') SettingsWelcome.channelResponse(client, interaction, id)
  }
}