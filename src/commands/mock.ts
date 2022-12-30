import { CommandInteraction } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mock')
		.setDescription('COnverT tExt INTo mOCKinG spOngebOB tEXT')
		.addStringOption(option => option.setName('text').setDescription("Text you'd like to convert to mocking Spongebob text").setRequired(true))
	,
	async execute(interaction: CommandInteraction) {
		const userInput = interaction.options.getString('text')?.toLowerCase()!
		let mockMsg = ''

		for (var i = 0; i < userInput.length; i++) {
			const rand = Math.floor(Math.random() * 5) // Pick a random number between 0 and 4, inclusive
			mockMsg += rand < 3 ? userInput.charAt(i).toUpperCase() : userInput.charAt(i)
		}
		await interaction.reply(mockMsg)
	}
}