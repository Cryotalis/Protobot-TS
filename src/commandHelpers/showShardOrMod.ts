import { ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js'
import { database } from '../database/database.js'
import { findBestCIMatch } from '../utils/string.js'
import { getModInfo, getShardInfo } from './getShardOrModInfo.js'

export function showShard(interaction: ChatInputCommandInteraction) {
    showShardOrMod(interaction, 'shard')
}

export function showMod(interaction: ChatInputCommandInteraction) {
    showShardOrMod(interaction, 'mod')
}

async function showShardOrMod(interaction: ChatInputCommandInteraction, type: 'shard' | 'mod') {
    const userInput = interaction.options.getString('name')!
    const allShardNames = database.shards.map(shard => shard.get('name'))
    const allModNames = database.mods.map(mod => mod.get('name'))
    const shardBestMatch = findBestCIMatch(userInput, allShardNames).bestMatch
    const modBestMatch = findBestCIMatch(userInput, allModNames).bestMatch
    
    const targetMod = database.mods.find(mod => mod.get('name') === modBestMatch.target)!
    const targetShard = database.shards.find(shard => shard.get('name') === shardBestMatch.target)!
    const shardOrModInfo = type === 'shard' ? getShardInfo(targetShard) : getModInfo(targetMod)
    
    const shouldHideShardSuggestion = (type === 'shard') && (shardBestMatch.rating >= modBestMatch.rating)
    const shouldHideModSuggestion = (type === 'mod') && (modBestMatch.rating >= shardBestMatch.rating)
    const shouldHideSuggestion = shouldHideShardSuggestion || shouldHideModSuggestion
    
    if (shouldHideSuggestion) {
        interaction.reply(shardOrModInfo)
    } else {
        const suggestionButton = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('primary')
                    .setLabel(type === 'shard'
                        ? `Looking for ${targetMod.get('name')} (the mod)?`
                        : `Looking for ${targetShard.get('name')} (the shard)?`
                    )
                    .setStyle(ButtonStyle.Primary)
            )

        const response = await interaction.reply({ ...shardOrModInfo, components: [suggestionButton] })

        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: msg => msg.user.id === interaction.user.id,
            time: 30000
        })

        collector.on('collect', i => {
            i.update({
                ...(type === 'shard' ? getModInfo(targetMod) : getShardInfo(targetShard)),
                components: []
            })
        }) 
    }
}