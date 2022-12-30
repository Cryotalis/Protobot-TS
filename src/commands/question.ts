import { CommandInteraction } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import { decode } from 'html-entities'
import axios from 'axios'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('question')
		.setDescription('Generate a random conversation starter question')
	,
	async execute(interaction: CommandInteraction) {
		const {data} = await axios.get('https://conversationstartersworld.com/random-question-generator/')
		await interaction.reply(decode(data.match(/(?<=Your Random Question:<\/h2>\n\n\n).+?(?=\n)/s)!.toString()))
	}
}