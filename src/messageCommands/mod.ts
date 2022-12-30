import { Client, Message, MessageEmbed } from 'discord.js'
import { GoogleSpreadsheetRow } from 'google-spreadsheet'
import { findBestMatch } from 'string-similarity'
import { heroEmotes } from '../library'
import { mods } from '../index'

exports.run = async (client: Client, message: Message, prefix: string, args: string[]) => {
    const modNames = mods.map(mod => mod.name)
    const modBestMatch = findBestMatch(args.join(' '), modNames).bestMatch
    let target = modBestMatch.target
    if (!/Chip|Servo/i.test(args.join(' ')) && mods.find(mod => mod.name === target.replace('Chip', 'Servo'))) {target = target.replace('Chip', 'Servo')}
    const mod: GoogleSpreadsheetRow = mods.find(mod => mod.name === target)!

    const modEmbed = new MessageEmbed()
        .setColor('ORANGE')
        .setAuthor({name: mod.name, iconURL: mod.dropURL})
        .setThumbnail(mod.image)
        .setDescription(mod.description)
        .addField('Acquisition:', mod.drop)
        .addField('Usable by:', mod.hero.split(', ').map((hero: string) => heroEmotes[hero]).join(''), false)
        .setFooter({text: `${mod.type} Mod`})

    message.reply({embeds: [modEmbed], allowedMentions: {repliedUser: false}})
}