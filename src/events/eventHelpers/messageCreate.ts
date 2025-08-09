import { EmbedBuilder, Message } from "discord.js"

export function createDelMsgEmbed(message: Message, numWarnings: number, reason: string){
    if (!message.content){message.content = 'No Content'}
    return new EmbedBuilder()
        .setColor('Red')
        .setAuthor({name: `${message.author.tag}  |  ${numWarnings} Warnings`, iconURL: message.author.displayAvatarURL({extension: 'png'})})
        .setDescription(`Message sent by ${message.author} deleted in ${message.channel}`)
        .addFields([
            {name: 'Content', value: message.content.length > 1024 ? `${message.content.slice(0, 1020)}...` : message.content},
            {name: 'Reason', value: `Trade Channel Rule Violation: ${reason}`}
        ])
        .setFooter({text: `Author: ${message.author.id} | Message ID: ${message.id}`})
        .setTimestamp(new Date())
}