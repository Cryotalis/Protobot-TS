import { OmitPartialGroupDMChannel, Message, PartialMessage } from 'discord.js'
import { DD_SERVER_ID } from '../data/discord.js'
import { recentMessages } from './eventHelpers/spamAutomod.js'

export async function onMessageDelete(message: OmitPartialGroupDMChannel<Message<boolean> | PartialMessage<boolean>>) {
    if (!message.author || message.author.bot) return

    if (message.guildId === DD_SERVER_ID) {
        const existingMessageIndex = recentMessages.findIndex(m => m.id === message.id)
        if (existingMessageIndex !== -1) {
            recentMessages.splice(existingMessageIndex, 1)
        }
    }
}