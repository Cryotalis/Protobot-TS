import { ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ComponentType, ButtonStyle, SlashCommandBuilder } from 'discord.js'
import { shards, mods, client } from '../index.js'
import { findBestCIMatch, heroEmotes } from '../library.js'

export const command = {
	data: new SlashCommandBuilder()
		.setName('mod')
		.setDescription('Fetch information about a mod in DD2')
		.addStringOption(option => option.setName('name').setDescription('The name of the mod').setRequired(true))
	,
	async execute(interaction: ChatInputCommandInteraction) {
		const userInput = interaction.options.getString('name')!
		const shardNames = shards.map(shard => shard.get('name'))
		const modNames = mods.map(mod => mod.get('name'))
		const shardBestMatch = findBestCIMatch(userInput, shardNames).bestMatch
		const modBestMatch = findBestCIMatch(userInput, modNames).bestMatch
		let target = modBestMatch.target
		if (!/Chip|Servo/i.test(userInput) && mods.find(mod => mod.get('name') === target.replace('Chip', 'Servo'))) {target = target.replace('Chip', 'Servo')}
		const mod = mods.find(mod => mod.get('name') === target)!

		const modEmbed = new EmbedBuilder()
			.setColor('Blue')
			.setAuthor({name: mod.get('name'), iconURL: mod.get('dropURL')})
			.setThumbnail(mod.get('image'))
			.setDescription(mod.get('description'))
			.addFields([
				{name: 'Acquisition:', value: mod.get('drop')},
				{name: 'Usable by:', value: mod.get('hero').split(', ').map((hero: string) => heroEmotes[hero]).join(""), inline: false}
			])
			.setFooter({text: `${mod.get('type')} Mod`})

		const suggestionButton = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('primary')
					.setLabel(`Looking for ${shardBestMatch.target} (the shard)?`)
					.setStyle(ButtonStyle.Primary)
			)
		
		await interaction.reply({embeds: [modEmbed], components: shardBestMatch.rating > modBestMatch.rating ? [suggestionButton] : [], fetchReply: true}).then(async msg => {
			if (shardBestMatch.rating <= modBestMatch.rating) return
			const collector = (await interaction.fetchReply()).createMessageComponentCollector({componentType: ComponentType.Button, filter: msg => msg.user.id === interaction.user.id, time: 30000})
			collector?.on('collect', async () => {
				await interaction.editReply({content: '```/shard name: ' + shardBestMatch.target + '```', embeds: [], components: []})
				const command = require('../messageCommands/shard.js')
				command.run(client, msg, '/', [shardBestMatch.target]) 
			})
		})
	}
}