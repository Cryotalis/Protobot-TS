import { Client, Message, EmbedBuilder } from 'discord.js'
import { findBestMatch } from 'string-similarity'
import { database } from '../database/index.js'
import { heroEmotes } from '../data/discord.js'

exports.run = async (client: Client, message: Message, prefix: string, args: string[]) => {
    const modNames = database.mods.map(mod => mod.get('name'))
    const modBestMatch = findBestMatch(args.join(' '), modNames).bestMatch
    let target = modBestMatch.target
    if (!/Chip|Servo/i.test(args.join(' ')) && database.mods.find(mod => mod.get('name') === target.replace('Chip', 'Servo'))) {target = target.replace('Chip', 'Servo')}
    const mod = database.mods.find(mod => mod.get('name') === target)!

    const modEmbed = new EmbedBuilder()
        .setColor('Blue')
        .setAuthor({name: mod.get('name')})
        .setThumbnail(mod.get('image'))
        .setDescription(mod.get('description'))
        .addFields([
            {name: 'Acquisition:', value: mod.get('drop')},
            {name: 'Usable by:', value: mod.get('hero').split(', ').map((hero: string) => heroEmotes[hero]).join(''), inline: false}
        ])
        .setFooter({text: `${mod.get('type')} Mod`})

    message.reply({embeds: [modEmbed], allowedMentions: {repliedUser: false}})
}