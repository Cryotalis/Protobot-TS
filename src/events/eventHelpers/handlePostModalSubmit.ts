import { ModalSubmitInteraction, CacheType, Message, AnyThreadChannel, MessageFlags, MessageEditOptions, ChannelType, EmbedBuilder } from 'discord.js'
import { BOT_ID } from '../../data/discord.js'

export async function handlePostModalSubmit(interaction: ModalSubmitInteraction<CacheType>) {
    if (interaction.channel?.type !== ChannelType.GuildText) { return }

    const messageID = interaction.fields.getTextInputValue('messageID')
    const content = interaction.fields.getTextInputValue('textContent')
    const files = interaction.fields.getUploadedFiles('files')?.map(f => f)
    const postOptions = interaction.fields.getStringSelectValues('options')

    let targetMessage: Message<boolean> | undefined
    let postHistory: AnyThreadChannel | undefined

    if (messageID) {
        if (/[^\d]+/.test(messageID)) {
            interaction.reply({
                content: 'Message ID must contain numbers only!',
                flags: MessageFlags.Ephemeral
            })
            return
        }
        
        targetMessage = await interaction.channel!.messages.fetch(messageID).catch(() => undefined)
        if (!targetMessage) {
            interaction.reply({
                content: `I could not find a message with ID: ${messageID}!`,
                flags: MessageFlags.Ephemeral
            })
            return
        } 
        
        if (targetMessage.author.id !== BOT_ID) {
            interaction.reply({
                content: `I cannot edit another user's message!`,
                flags: MessageFlags.Ephemeral
            })
            return
        }

        const editOptions: MessageEditOptions = {
            ...(content ? { content } : postOptions.includes('Remove Text') ? { content: null } : {}),
            ...(files ? { files } : postOptions.includes('Remove Files') ? { files: [] } : {}),
        }

        const deleteCondition1 = !targetMessage.content && editOptions.files?.length === 0
        const deleteCondition2 = !targetMessage.attachments && editOptions.content === null
        const doDeleteMessage = postOptions.includes('Delete') || deleteCondition1 || deleteCondition2
        doDeleteMessage
            ? await targetMessage.delete()
            : await targetMessage.edit(editOptions)

        const channelThreads = (await interaction.channel.threads.fetch()).threads
        postHistory = channelThreads.find(t => t.name.includes(messageID))
    } else if (content || files) {
        targetMessage = await interaction.channel.send({ content, files })
        postHistory = await interaction.channel.threads.create({
            name: `Edit History for ${targetMessage.id}`,
            type: ChannelType.PrivateThread,
            invitable: false,
        })
    } else {
        interaction.reply({
            content: 'Post must contain text or files!',
            flags: MessageFlags.Ephemeral
        })
        return
    }

    const historyEmbed = new EmbedBuilder()
        .setAuthor({
            name: `${messageID ? 'Edited' : 'Posted'} by ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL()
        })
        .setDescription(content || 'Text Content unchanged.')
        .addFields([{ name: 'Post Options', value: postOptions.join(', ') || 'None' }])
    postHistory?.send({ embeds: [historyEmbed], files })

    if (postOptions.includes('Pin') && !targetMessage.pinned) { await targetMessage.pin() }
    if (postOptions.includes('Unpin') && targetMessage.pinned) { await targetMessage.unpin() }

    interaction.reply({
        content: !targetMessage.deletable
            ? 'Post deleted.'
            : messageID
                ? 'Post edited.'
                : 'Post created.',
        flags: MessageFlags.Ephemeral
    })
}