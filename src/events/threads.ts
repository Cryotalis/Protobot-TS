import { ForumChannel } from "discord.js"
import { client } from "../index.js"

const forumIDs = [
    '1183125378613657720', // bug-report-test
    '1166774506002591765', // server-suggestions
    '1167947531469201469', // role-requests
]
client.on('threadCreate', async thread => {
    if (!forumIDs.includes(thread.parent?.id ?? '')) return
    const messages = await thread.awaitMessages({max: 1, time: 5000})
    const starterMessage = messages.first()
    if (!starterMessage) return
    await starterMessage.react('<:thumbs_up:745501111015833632>')
    await starterMessage.react('<:thumbs_sideways:745501110403465318>')
    await starterMessage.react('<:thumbs_down:745501108075626578>')
})

client.on('threadUpdate', (oldThread, newThread) => {
    const oldTags = oldThread.appliedTags
    const newTags = newThread.appliedTags
    if (!forumIDs.includes(oldThread.parent?.id ?? '') || oldTags.join() === newTags.join()) return

    const tags = (oldThread.parent as ForumChannel).availableTags
    const tag = tags.find(tag => tag.id === (newTags.length > oldTags.length ? newTags.find(tag => !oldTags.includes(tag)) : oldTags.find(tag => !newTags.includes(tag))))!
    const tagEmoji = tag.emoji 
        ? tag.emoji.id 
            ? `<:${tag.emoji.name}:${tag.emoji.id}> `
            : tag.emoji.name + ' '
        : ''

    if (newTags.length > oldTags.length) {
        newThread.send({content: `<@${oldThread.ownerId}>, your post has been tagged as **${tagEmoji + tag.name}**.`, flags: ['SuppressNotifications']})
    } else {
        newThread.send({content: `<@${oldThread.ownerId}>, the **${tagEmoji + tag.name}** tag has been removed from your post.`, flags: ['SuppressNotifications']})
    }
})