import { EmbedBuilder, TextChannel } from "discord.js"
import { schedule } from "node-cron"
import { database } from "../database/index.js"
import { client } from "../index.js"
import { getTwitchUserInfo, streamInfo, userInfo } from "../library.js"

// Twitch Live Notifications
export interface channelConfig {id: string, message: string | null, categories: string[]}
schedule('* * * * *', () => {
    if (!database.twitchChannels) return
    database.twitchChannels.forEach(async channel => {
        const configs: channelConfig[] = JSON.parse(channel.get('configs') || '[]')
        if (configs.length === 0) return
        const [streamInfo, userInfo] = await Promise.all([
            getTwitchUserInfo(channel.get('username'), 1) as Promise<streamInfo>,
            getTwitchUserInfo(channel.get('username'), 0) as Promise<userInfo>
        ])
        if (!streamInfo || !userInfo) return
        const recentStreamIDs: string[] = JSON.parse(channel.get('recentStreamIDs') || '[]')
        if (recentStreamIDs.includes(streamInfo.id)) return

        const twitchStreamEmbed = new EmbedBuilder()
            .setAuthor({name: 'Twitch', iconURL: 'https://cdn.icon-icons.com/icons2/3041/PNG/512/twitch_logo_icon_189242.png'})
            .setTitle(`${streamInfo.user_name} is now playing ${streamInfo.game_name}!`)
            .setURL(`https://www.twitch.tv/${channel.get('username')}`)
            .setDescription(streamInfo.title)
            .setThumbnail(userInfo.profile_image_url)
            .setColor('Purple')

        configs.forEach((config: channelConfig) => {
            const discordChannel = client.channels.cache.get(config.id) as TextChannel
            discordChannel.send({content: config.message!, embeds: [twitchStreamEmbed]})
        })

        if (recentStreamIDs.length >= 5) recentStreamIDs.shift() // Only store the 5 most recent stream IDs
        recentStreamIDs.push(streamInfo.id)
        channel.set('recentStreamIDs', JSON.stringify(recentStreamIDs)) // Store the stream ID so that it doesn't get posted again
        channel.save()
    })
})