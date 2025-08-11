import { EmbedBuilder, Message } from "discord.js"
import { GoogleSpreadsheetRow } from "google-spreadsheet"
import { UserLogInfo } from "../../database/privateTypes.js"

const tradeRules = 
`1. Follow the trading format below.
2. One trade per line, no more than 1 image per message.
3. Do not discuss trades here. See market-discussion.
4. If a trade has been completed, delete or edit the original post.
5. Do not post advertisements more than once every 23 hours.

You must include at least one of the following in your listing:
[**H**] = **Have**
[**W**] = **Want**

Example Trades:
[H] 99 Pristine Motes [W] 3m <:gold:460345588911833088>
[W] 99 Shiny Motes    [H] 3m <:gold:460345588911833088>

Trade Format(copy & paste):
\`\`\`
[H] item-name  [W] :gold:
[W] item-name  [H] :gold:
\`\`\``

/**
 * Creates an embed logging the deletion of the offending message
 * @param msg - Message which triggered the automod
 */
export function createAMLogEntry(msg: Message, numWarnings: number, reason: string) {
    if (!msg.content) msg.content = 'No Content'

    return new EmbedBuilder()
        .setColor('Red')
        .setAuthor({
            name: `${msg.author.username}  |  ${numWarnings} Warnings`,
            iconURL: msg.author.displayAvatarURL({extension: 'png'})
        })
        .setDescription(`Message sent by ${msg.author} deleted in ${msg.channel}`)
        .addFields([
            {name: 'Content', value: msg.content.length > 1024 ? `${msg.content.slice(0, 1020)}...` : msg.content},
            {name: 'Reason', value: `Trade Channel Rule Violation: ${reason}`}
        ])
        .setFooter({text: `Author: ${msg.author.id} | Message ID: ${msg.id}`})
        .setTimestamp(new Date())
}

/**
 * Sends a detailed notice to a user regarding the trade chat rule they violated.
 * @param violation - The rule that was violated
 * @param message - The offending message
 * @param user - The database entry for the user who violated trade chat rules
 */
export function DMRules(violation: 'Formatting' | '23 Hour Rule', message: Message, user: GoogleSpreadsheetRow<UserLogInfo>){
    const embeds = [
        new EmbedBuilder()
            .setColor('Blue')
            .setTitle('Looking-For-Trade Channel Rules:')
            .setDescription(tradeRules),
        new EmbedBuilder()
            .setColor('Blue')
            .setTitle("Here's what you posted:")
            .setDescription('```' + message.content + '```')
    ]

    if (violation === '23 Hour Rule') {
        const cooldownEnd = `<t:${Date.parse(user.get('lastMsgTimestamp'))/1000 + 8.28e+4}>`

        embeds.push(
            new EmbedBuilder()
                .setColor('Blue')
                .setDescription(`You may post again after ${cooldownEnd}`)
        )
    }

    const violationDetails = violation === '23 Hour Rule'
        ? 'You cannot post more than once per 23 hours!'
        : 'Your Looking-For-Trade post did not follow the correct format!'
    
    message.author.send({
        content: `${violationDetails} Please review the Looking-For-Trade channel rules here:`,
        embeds: embeds
    })
}