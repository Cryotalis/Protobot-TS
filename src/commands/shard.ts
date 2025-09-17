import { ChatInputCommandInteraction, ActionRowBuilder, ComponentType, ButtonBuilder, ButtonStyle, SlashCommandBuilder } from 'discord.js'
import { database } from '../database/database.js'
import { findBestCIMatch } from '../utils/string.js'
import { getShardEmbed } from '../commandHelpers/shard.js'
import { getModEmbed, getServoVariant } from '../commandHelpers/mod.js'

export const command = {
	data: new SlashCommandBuilder()
		.setName('shard')
		.setDescription('Fetch information about a shard in DD2')
        .addStringOption(option => option.setName('name').setDescription('The name of the shard').setRequired(true))
    ,
	async execute(interaction: ChatInputCommandInteraction) {
        const userInput = interaction.options.getString('name')!
        const allShardNames = database.shards.map(shard => shard.get('name'))
        const allModNames = database.mods.map(mod => mod.get('name'))
        const shardBestMatch = findBestCIMatch(userInput, allShardNames).bestMatch
        const modBestMatch = findBestCIMatch(userInput, allModNames).bestMatch
        const modTarget = /Chip|Servo/i.test(userInput)
            ? modBestMatch.target
            : getServoVariant(modBestMatch.target)

        const shard = database.shards.find(shard => shard.get('name') === shardBestMatch.target)!
        const shardEmbed = getShardEmbed(shard)

        const suggestionButton = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('primary')
                    .setLabel(`Looking for ${modTarget} (the mod)?`)
                    .setStyle(ButtonStyle.Primary)
            )
        
        if (shardBestMatch.rating >= modBestMatch.rating) {
			interaction.reply({ embeds: [shardEmbed] })
		} else {
			const response = await interaction.reply({ embeds: [shardEmbed], components: [suggestionButton] })
			const collector = response.createMessageComponentCollector({
				componentType: ComponentType.Button,
				filter: msg => msg.user.id === interaction.user.id,
				time: 30000
			})
			collector.on('collect', () => {
				const mod = database.mods.find(mod => mod.get('name') === modTarget)!
				interaction.editReply({ embeds: [getModEmbed(mod)], components: [] })
			})
				
		}
	}
}