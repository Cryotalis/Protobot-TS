import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { links } from '../index'
import { findBestCIMatch } from '../library'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('link')
		.setDescription('Fetch a link for a commonly referenced resource')
		.addStringOption(option => option.setName('link').setDescription('The name of the link of the commonly referenced resource').setRequired(true))
		.addUserOption(option => option.setName('target').setDescription('The user to mention with this command'))
	,
	async execute(interaction: ChatInputCommandInteraction) {
		const userInput = interaction.options.getString('link')!
		const targettedUser = interaction.options.getUser('target')!
		const key = findBestCIMatch(userInput, links.map(entry => entry.name)).bestMatch.target
		const link = links.find(entry => entry.name === key)!

		const linkEmbed = new EmbedBuilder()
			.setColor('Blue')
			.setAuthor({name: link.author})
			.setTitle(link.name)
			.setURL(link.link)
			.setDescription(link.description)

		await interaction.reply({content: targettedUser ? `*Link for ${targettedUser}:*` : undefined, embeds: [linkEmbed]})
	}
}