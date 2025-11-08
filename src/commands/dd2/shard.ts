import { ChatInputCommandInteraction, ActionRowBuilder, ComponentType, ButtonBuilder, ButtonStyle, SlashCommandBuilder } from 'discord.js'
import { database } from '../../database/database.js'
import { findBestCIMatch } from '../../utils/string.js'
import { getShardEmbed } from '../../commandHelpers/getShardEmbed.js'
import { getModEmbed } from '../../commandHelpers/getModEmbed.js'

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
        
        const targetMod = database.mods.find(mod => mod.get('name') === modBestMatch.target)!
        const targetShard = database.shards.find(shard => shard.get('name') === shardBestMatch.target)!
        const shardEmbed = getShardEmbed(targetShard)

        const suggestionButton = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('primary')
                    .setLabel(`Looking for ${targetMod.get('name')} (the mod)?`)
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
				interaction.editReply({ embeds: [getModEmbed(targetMod)], components: [] })
			})
				
		}
	}
}