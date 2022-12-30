import { CommandInteraction, MessageEmbed } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import { findBestMatch } from 'string-similarity'
import { links } from '../index'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('link')
		.setDescription('Fetch a link for a commonly referenced resource')
		.addStringOption(option => option.setName('link').setDescription('The name of the link of the commonly referenced resource').setRequired(true))
		.addUserOption(option => option.setName('target').setDescription('The user to mention with this command'))
	,
	async execute(interaction: CommandInteraction) {
		const userInput = interaction.options.getString('link')!
		const targettedUser = interaction.options.getUser('target')!
		const key = findBestMatch(userInput.toLowerCase(), links.map(entry => entry.name.toLowerCase())).bestMatch.target
		const link = links.find(entry => entry.name.toLowerCase() === key)!

		const linkEmbed = new MessageEmbed()
			.setColor('ORANGE')
			.setAuthor({name: link.author})
			.setTitle(link.name)
			.setURL(link.link)
			.setDescription(link.description)

		await interaction.reply({content: targettedUser ? `*Link for ${targettedUser}:*` : null, embeds: [linkEmbed]})
	}
}