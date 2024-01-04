import { Client, Message, EmbedBuilder } from 'discord.js'
import { GoogleSpreadsheetRow } from 'google-spreadsheet'
import { findBestMatch } from 'string-similarity'
import { heroEmotes } from '../library'
import { shards } from '../index'

exports.run = async (client: Client, message: Message, prefix: string, args: string[]) => {
    const shardNames = shards.map(shard => shard.get('name'))
    const shardBestMatch = findBestMatch(args.join(' '), shardNames).bestMatch
    const shard: GoogleSpreadsheetRow = shards.find(shard => shard.get('name') === shardBestMatch.target)!

    const shardEmbed = new EmbedBuilder()
        .setColor('Blue')
        .setAuthor({name: shard.get('name'), iconURL: shard.get('dropURL')})
        .setThumbnail(shard.get('image'))
        .setDescription(shard.get('description'))
        .addFields([
            {name: 'Gilded: ', value: shard.get('gilded'), inline: false},
            {name: 'Usable by:', value: shard.get('hero').split(', ').map((hero: string) => heroEmotes[hero]).join(''), inline: false}
        ])
        .setFooter({text: `Upgrade Levels: ${shard.get('upgradeLevels')} | ${shard.get('type')} | ${shard.get('drop')}`})

    message.reply({embeds: [shardEmbed], allowedMentions: {repliedUser: false}})
}