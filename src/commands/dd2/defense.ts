import { ChatInputCommandInteraction, ActionRowBuilder, SlashCommandBuilder, ComponentType, StringSelectMenuBuilder } from 'discord.js'
import { defenseBuildData } from '../../database/defenseBuilds.js'
import { findBestCIMatch } from '../../utils/string.js'
import { generateBuildImage } from '../commandHelpers/defense.js'

export const command = {
	data: new SlashCommandBuilder()
		.setName('defense')
		.setDescription('Fetch a build from the DD2 Defense Build Guides spreadsheet')
		.addStringOption(option => option.setName('name').setDescription('The name of the defense').setRequired(true))
		.addStringOption(option => option.setName('role').setDescription('The role of the defense').setRequired(false))
	,
	async execute(interaction: ChatInputCommandInteraction) {
		const nameInput = interaction.options.getString('name')!
		const roleInput = interaction.options.getString('role')

		const defenseName = findBestCIMatch(nameInput, defenseBuildData.map(({name}) => name)).bestMatch.target
		const roleOptions = [...new Set(
			defenseBuildData
				.filter(({name}) => name === defenseName)
				.map(defense => defense.role)
		)]
		
		if (roleInput || roleOptions.length === 1) {
			const defenseRole = roleInput
				? findBestCIMatch(roleInput, roleOptions).bestMatch.target
				: roleOptions[0]
			await interaction.reply({ files: [await generateBuildImage(defenseName, defenseRole)] })
			return 
		}
	
		const menu = new ActionRowBuilder<StringSelectMenuBuilder>()
			.addComponents(
				new StringSelectMenuBuilder()
					.setCustomId('Defense Build Selector')
					.setPlaceholder('Select a build')
					.addOptions(roleOptions.map(option => ({label: option, value: option})))
			)
		
		interaction.reply({ content: `Please select a **${defenseName}** build:`, components: [menu] }).then(response => {
			const collector = response.createMessageComponentCollector({
				componentType: ComponentType.StringSelect,
				filter: msg => msg.user.id === interaction.user.id,
				time: 30000,
				max: 1
			})
			collector.on('collect', async i => {
				i.deferUpdate()
				interaction.editReply({
					content: null,
					components: [],
					files: [await generateBuildImage(defenseName, i.values[0])]
				})
			})
		})
	}
}