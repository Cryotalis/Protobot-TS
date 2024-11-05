import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'

export const command = {
	data: new SlashCommandBuilder()
		.setName('mock')
		.setDescription('COnverT tExt INTo mOCKinG spOngebOB tEXT')
		.addStringOption(option => option.setName('text').setDescription("Text you'd like to convert to mocking Spongebob text").setRequired(true))
	,
	async execute(interaction: ChatInputCommandInteraction) {
        const text = interaction.options.getString('text')?.toLowerCase()!
		let mockMsg = ''

        for (const letter of text){
			const rand = Math.floor(Math.random() * 100)
			mockMsg += rand < 50 ? letter.toUpperCase() : letter
		}
		return interaction.reply(mockMsg)
	}
}