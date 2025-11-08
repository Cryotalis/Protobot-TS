import { EmbedBuilder } from 'discord.js'
import { GoogleSpreadsheetRow } from 'google-spreadsheet'
import { ModInfo } from '../database/publicTypes.js'
import { heroEmotes } from '../data/discord.js'
import { database } from '../database/database.js'

export function getModEmbed(modInput: GoogleSpreadsheetRow<ModInfo>) {
    const mod = getServoVariant(modInput)
    
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

function getServoVariant(mod: GoogleSpreadsheetRow<ModInfo>) {
    const servoName = mod.get('name').replace('Chip', 'Servo')
    const servoVariant = database.mods.find(mod => mod.get('name') === servoName)
    return servoVariant || mod
}