import { CommandInteraction } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('drunk')
		.setDescription('Convfrt text joto erunk text')
		.addStringOption(option => option.setName('text').setDescription("The text you'd like to convert to drunk text").setRequired(true))
	,
	async execute(interaction: CommandInteraction) {
		const userInput = interaction.options.getString('text')!
		let drunkMsg = ''
	
		for (let i = 0; i < userInput.length; i++) {
			const rand = Math.floor(Math.random() * 5) // Pick a random number between 0 and 4, inclusive (20% chance)
			if (rand === 0 && /\w/.test(userInput.charAt(i))) {
				drunkMsg += String.fromCharCode(userInput.charCodeAt(i) + 1) // Shift the letter to the right (a -> b, b -> c, etc)
			} else {
				drunkMsg += userInput.charAt(i) // Leave the letter alone otherwise
			}
		}
		await interaction.reply(drunkMsg)
	}
}