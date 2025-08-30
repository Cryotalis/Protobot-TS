import { MessageCreateOptions, MessagePayload, TextChannel } from 'discord.js'
import { client } from '../index.js'

export async function sendToChannel(channelID: string, message: string | MessagePayload | MessageCreateOptions) {
    const channel = await client.channels.fetch(channelID) as TextChannel
    if (channel) channel.send(message)
}