import { GoogleSpreadsheetRow } from 'google-spreadsheet'
import { ShardInfo } from '../../database/publicTypes.js'
import { EmbedBuilder } from 'discord.js'
import { heroEmotes } from '../../data/discord.js'

export function getShardEmbed(shard: GoogleSpreadsheetRow<ShardInfo>) {
    return new EmbedBuilder()
        .setColor('Blue')
        .setAuthor({name: shard.get('name'), iconURL: shard.get('dropURL')})
        .setThumbnail(shard.get('image'))
        .setDescription(shard.get('description'))
        .addFields([
            { name: 'Gilded: ', value: shard.get('gilded'), inline: false },
            {
                name: 'Usable by:',
                value: shard.get('hero').split(', ').map((hero: string) => heroEmotes[hero]).join(''),
                inline: false
            }
        ])
        .setFooter({
            text: `Upgrade Levels: ${shard.get('upgradeLevels')} | ${shard.get('type')} | ${shard.get('drop')}`
        })
}
