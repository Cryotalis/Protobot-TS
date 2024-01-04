import { ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ComponentType, ButtonStyle, SlashCommandBuilder } from 'discord.js'
import { shards, mods, client } from '../index'
import { findBestCIMatch, heroEmotes } from '../library'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mod')
		.setDescription('Fetch information about a mod in DD2')
		.addStringOption(option => option.setName('name').setDescription('The name of the mod').setRequired(true))
	,
	async execute(interaction: ChatInputCommandInteraction) {
		const userInput = interaction.options.getString('name')!
		const shardNames = shards.map(shard => shard.name)
		const modNames = mods.map(mod => mod.name)
		const shardBestMatch = findBestCIMatch(userInput, shardNames).bestMatch
		const modBestMatch = findBestCIMatch(userInput, modNames).bestMatch
		let target = modBestMatch.target
		if (!/Chip|Servo/i.test(userInput) && mods.find(mod => mod.name === target.replace('Chip', 'Servo'))) {target = target.replace('Chip', 'Servo')}
		const mod = mods.find(mod => mod.name === target)!

		const modEmbed = new EmbedBuilder()
			.setColor('Blue')
			.setAuthor({name: mod.name, iconURL: mod.dropURL})
			.setThumbnail(mod.image)
			.setDescription(mod.description)
			.addFields([
				{name: 'Acquisition:', value: mod.drop},
				{name: 'Usable by:', value: mod.hero.split(', ').map((hero: string) => heroEmotes[hero]).join(""), inline: false}
			])
			.setFooter({text: `${mod.type} Mod`})

		const suggestionButton = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('primary')
					.setLabel(`Looking for ${shardBestMatch.target} (the shard)?`)
					.setStyle(ButtonStyle.Primary)
			)
		
		await interaction.reply({embeds: [modEmbed], components: shardBestMatch.rating > modBestMatch.rating ? [suggestionButton] : [], fetchReply: true}).then(msg => {
			if (shardBestMatch.rating <= modBestMatch.rating) return
			const collector = interaction.channel?.createMessageComponentCollector({componentType: ComponentType.Button, filter: msg => msg.member?.user.id === msg.member?.user.id, time: 30000})
			collector?.on('collect', async () => {
				await interaction.editReply({content: `/shard name: ${shardBestMatch.target}`, embeds: [], components: []})
				const command = require('../messageCommands/shard')
				command.run(client, msg, '/', [shardBestMatch.target]) 
			})
		})
	}
}