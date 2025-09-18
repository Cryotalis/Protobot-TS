import { EmbedBuilder } from 'discord.js'
import { GoogleSpreadsheetRow } from 'google-spreadsheet'
import { ModInfo } from '../../database/publicTypes.js'
import { heroEmotes } from '../../data/discord.js'
import { database } from '../../database/database.js'

export function getModEmbed(mod: GoogleSpreadsheetRow<ModInfo>) {
    return new EmbedBuilder()
        .setColor('Blue')
        .setAuthor({ name: mod.get('name') })
        .setThumbnail(mod.get('image'))
        .setDescription(mod.get('description'))
        .addFields([
            { name: 'Acquisition:', value: mod.get('drop') },
            {
                name: 'Usable by:',
                value: mod.get('hero').split(', ').map((hero: string) => heroEmotes[hero]).join(''),
                inline: false
            }
        ])
        .setFooter({text: `${mod.get('type')} Mod`})
}

export function getServoVariant(modName: string) {
    const servoVariant = modName.replace('Chip', 'Servo')
    const hasServoVariant = database.mods.find(mod => mod.get('name') === servoVariant)
    return hasServoVariant ? servoVariant : modName
}