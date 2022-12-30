import { Client, Message, MessageEmbed } from 'discord.js'
import { GoogleSpreadsheetRow } from 'google-spreadsheet'
import { findBestMatch } from 'string-similarity'
import { heroEmotes } from '../library'
import { shards } from '../index'

exports.run = async (client: Client, message: Message, prefix: string, args: string[]) => {
    const shardNames = shards.map(shard => shard.name)
    const shardBestMatch = findBestMatch(args.join(' '), shardNames).bestMatch
    const shard: GoogleSpreadsheetRow = shards.find(shard => shard.name === shardBestMatch.target)!

    const shardEmbed = new MessageEmbed()
        .setColor('ORANGE')
        .setAuthor({name: shard.name, iconURL: shard.dropURL})
        .setThumbnail(shard.image)
        .setDescription(shard.description)
        .addField('Gilded: ', shard.gilded, false)
        .addField('Usable by:', shard.hero.split(', ').map((hero: string) => heroEmotes[hero]).join(''), false)
        .setFooter({text: `Upgrade Levels: ${shard.upgradeLevels} | ${shard.type} | ${shard.drop}`})

    message.reply({embeds: [shardEmbed], allowedMentions: {repliedUser: false}})
}