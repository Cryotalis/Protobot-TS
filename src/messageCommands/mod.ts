import { Client, Message, EmbedBuilder } from 'discord.js'
import { GoogleSpreadsheetRow } from 'google-spreadsheet'
import { findBestMatch } from 'string-similarity'
import { heroEmotes } from '../library'
import { mods } from '../index'

exports.run = async (client: Client, message: Message, prefix: string, args: string[]) => {
    const modNames = mods.map(mod => mod.get('name'))
    const modBestMatch = findBestMatch(args.join(' '), modNames).bestMatch
    let target = modBestMatch.target
    if (!/Chip|Servo/i.test(args.join(' ')) && mods.find(mod => mod.get('name') === target.replace('Chip', 'Servo'))) {target = target.replace('Chip', 'Servo')}
    const mod: GoogleSpreadsheetRow = mods.find(mod => mod.get('name') === target)!

    const modEmbed = new EmbedBuilder()
        .setColor('Blue')
        .setAuthor({name: mod.get('name'), iconURL: mod.get('dropURL')})
        .setThumbnail(mod.get('image'))
        .setDescription(mod.get('description'))
        .addFields([
            {name: 'Acquisition:', value: mod.get('drop')},
            {name: 'Usable by:', value: mod.get('hero').split(', ').map((hero: string) => heroEmotes[hero]).join(''), inline: false}
        ])
        .setFooter({text: `${mod.get('type')} Mod`})

    message.reply({embeds: [modEmbed], allowedMentions: {repliedUser: false}})
}