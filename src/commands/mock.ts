import { CommandInteraction } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mock')
		.setDescription('COnverT tExt INTo mOCKinG spOngebOB tEXT')
		.addStringOption(option => option.setName('text').setDescription("Text you'd like to convert to mocking Spongebob text").setRequired(true))
	,
	async execute(interaction: CommandInteraction) {
        const text = interaction.options.getString('text')?.toLowerCase()!
		let mockMsg = ''

        for (const letter of text){
			const rand = Math.floor(Math.random() * 100)
			mockMsg += rand < 50 ? letter.toUpperCase() : letter
		}
		return interaction.reply(mockMsg)
	}
}