import { ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ComponentType, ButtonStyle, SlashCommandBuilder } from 'discord.js'
import { database } from '../../database/database.js'
import { findBestCIMatch } from '../../utils/string.js'
import { getModEmbed, getServoVariant } from '../commandHelpers/mod.js'
import { getShardEmbed } from '../commandHelpers/shard.js'

export const command = {
	data: new SlashCommandBuilder()
		.setName('mod')
		.setDescription('Fetch information about a mod in DD2')
		.addStringOption(option => option.setName('name').setDescription('The name of the mod').setRequired(true))
	,
	async execute(interaction: ChatInputCommandInteraction) {
		const userInput = interaction.options.getString('name')!
		const allShardNames = database.shards.map(shard => shard.get('name'))
		const allModNames = database.mods.map(mod => mod.get('name'))
		const shardBestMatch = findBestCIMatch(userInput, allShardNames).bestMatch
		const modBestMatch = findBestCIMatch(userInput, allModNames).bestMatch

		const target = /Chip|Servo/i.test(userInput)
			? modBestMatch.target
			: getServoVariant(modBestMatch.target)

		const mod = database.mods.find(mod => mod.get('name') === target)!
		const modEmbed = getModEmbed(mod)

		const suggestionButton = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('primary')
					.setLabel(`Looking for ${shardBestMatch.target} (the shard)?`)
					.setStyle(ButtonStyle.Primary)
			)

		if (modBestMatch.rating >= shardBestMatch.rating) {
			interaction.reply({ embeds: [modEmbed] })
		} else {
			const response = await interaction.reply({ embeds: [modEmbed], components: [suggestionButton] })
			const collector = response.createMessageComponentCollector({
				componentType: ComponentType.Button,
				filter: msg => msg.user.id === interaction.user.id,
				time: 30000
			})
			collector.on('collect', () => {
				const shard = database.shards.find(shard => shard.get('name') === shardBestMatch.target)!
				interaction.editReply({ embeds: [getShardEmbed(shard)], components: [] })
			})
				
		}
	}
}