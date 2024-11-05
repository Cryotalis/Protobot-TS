import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'

export const command = {
	data: new SlashCommandBuilder()
		.setName('drunk')
		.setDescription('Convfrt text joto erunk text')
		.addStringOption(option => option.setName('text').setDescription("The text you'd like to convert to drunk text").setRequired(true))
	,
	async execute(interaction: ChatInputCommandInteraction) {
		const text = interaction.options.getString('text')!
		let drunkMsg = ''

		for (const letter of text){
			const rand = Math.floor(Math.random() * 100)
			drunkMsg += rand < 10 && /[a-y]/i.test(letter) // Ignores the letter Z, shifts the letter with a 10% chance
				? String.fromCharCode(letter.charCodeAt(0) + 1) // Shift the letter to the right (a -> b, b -> c, etc)
				: letter // Leave the letter alone otherwise
		}
		return interaction.reply(drunkMsg)
	}
}