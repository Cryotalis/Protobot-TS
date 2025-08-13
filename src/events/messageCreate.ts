import { Message, OmitPartialGroupDMChannel } from "discord.js"
import { database, UserLogInfo } from "../database/index.js"
import { automodLogChannel } from "../index.js"
import { createAMLogEntry, DMRules } from "./index.js"

const LFTAutomodChannels = [
    '460339922231099402',   // #looking-for-trade-pc
    '460340670960500737',   // #looking-for-trade-ps
    '460340942990475264'    // #looking-for-trade-xbox
]

export async function onMessageCreate(message: OmitPartialGroupDMChannel<Message<boolean>>) {
    if (message.author.bot) return

    if (LFTAutomodChannels.includes(message.channelId) && database.userLogs) {
        const user = database.userLogs.find(user => user.get('authorID') === message.author.id)
        if (!user) {
            const newUser = await database.userLogsTable.addRow({
                lastMsgID: message.id,
                lastMsgTimestamp: message.createdTimestamp.toString(),
                authorTag: message.author.username,
                authorID: message.author.id,
                warnings: '0'
            } as UserLogInfo)

            database.userLogs.push(newUser)
            return
        }

        const timePassed = new Date(message.createdTimestamp).getTime() - Date.parse(user.get('lastMsgTimestamp'))
        const cooldownViolated = timePassed < 8.28e+7 // 8.28e+7 = 23 hours
        const badFormatting = !/\[W\]|\[H\]|WTB|WTS/i.test(message.content)

        if (cooldownViolated || badFormatting){
            const violation = cooldownViolated ? '23 Hour Rule' : 'Formatting'
            try {
                await message.delete()
                user.set('warnings', String(parseInt(user.get('warnings')) + 1))
                await automodLogChannel.send({embeds: [createAMLogEntry(message, user.get('warnings'), violation)]})
                DMRules(violation, message, user)
            } catch (e){}
        } else {
            user.set('lastMsgID', message.id)
            user.set('lastMsgTimestamp', new Date(message.createdTimestamp).toString())
        }

        user.save()
    }
}