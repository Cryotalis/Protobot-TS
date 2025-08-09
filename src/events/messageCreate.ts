import { Message, ChannelType, EmbedBuilder } from "discord.js"
import { database } from "../database/index.js"
import { automodLogChannel, client } from "../index.js"
import { createDelMsgEmbed } from "./eventHelpers/messageCreate.js"

const tradeRules = '1. Follow the trading format below.\n2. One trade per line, no more than 1 image per message.\n3. Do not discuss trades here. See market-discussion.\n4. If a trade has been completed, delete or edit the original post.\n5. Do not post advertisements more than once every 23 hours.\n\n[**H**] = **Have**\n[**W**] = **Want**\nYou must include one of the above in your listing!\n\nExample Trades:\n[H]  99 Pristine Motes   [W] 3m <:gold:460345588911833088>\n[W] 99 Shiny Motes   [H] 3m <:gold:460345588911833088>\n\nTrade Format(copy & paste):\n```[H] item-name  [W] :gold:\n[W] item-name  [H] :gold:```'
client.on('messageCreate', async (message: Message) => {
    const LFTAutomodChannels = ['460339922231099402', '460340670960500737', '460340942990475264'] // The channels that should be automodded
    if (message.channel.type === ChannelType.DM || !LFTAutomodChannels.includes(message.channelId) || !automodLogChannel || message.author.bot || !database.userLogs) return

    function DMRules(violation: string){
        const dmEmbeds = [
            new EmbedBuilder().setColor('Blue').setTitle('Looking-For-Trade Channel Rules:').setDescription(tradeRules),
            new EmbedBuilder().setColor('Blue').setTitle("Here's what you posted:").setDescription(`\`\`\`${message.content}\`\`\``)
        ]
        if (violation.includes('23')){dmEmbeds.push(new EmbedBuilder().setColor('Blue').setDescription(`You may post again after <t:${Date.parse(user.time)/1000 + 8.28e+4}>`))}
        message.author.send({content: `${violation} Please review the Looking-For-Trade channel rules here:`, embeds: dmEmbeds})
    }
    
    const user = database.userLogs.find(user => user.get('authorID') === message.author.id) || {lastMsgID: '', authorID: '', time: new Date(message.createdTimestamp).toString(), warnings: 0}
    if (user.authorID !== "" && new Date(message.createdTimestamp).getTime() - Date.parse(user.time) < 8.28e+7){ //If the user is logged and their last message was within 23 hours, send a warning
        try{
            message.delete()
            DMRules('You cannot post more than once per 23 hours!')
            user.warnings ++
            automodLogChannel.send({embeds: [createDelMsgEmbed(message, user.warnings, '23 Hour Rule')]})
        } catch (e){}
    } else if (!/\[W\]|\[H\]|WTB|WTS/i.test(message.content)){ //If the message does not conform to the formatting rules, send a warning
        try{
            message.delete()
            DMRules('Your Looking-For-Trade post did not follow the correct format!')
            user.time = ""
            user.warnings ++
            automodLogChannel.send({embeds: [createDelMsgEmbed(message, user.warnings, 'Formatting')]})
        } catch (e){}
    } else { //If no warnings were given, log the timestamp
        user.time = new Date(message.createdTimestamp).toString()
    }

    user.lastMsgID = message.id
    user.authorID = `'${message.author.id}`
    if (!database.userLogs.find(user => user.get('authorID') === message.author.id)){
        user.authorTag = message.author.tag
        await database.userLogsTable.addRow(user)
        // TODO: Is this actually necessary?
        // If so, the row could just be added to the table via push to database.userLogs
        database.userLogs = await database.userLogsTable.getRows()
    } else {await user.save()}
})