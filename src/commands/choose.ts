import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { formatList } from '../library.js'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('choose')
		.setDescription('Ask Protobot to choose between 2 or more things')
		.addStringOption(option => option.setName('choices').setDescription('A list of options separated by commas').setRequired(true))
	,
	async execute(interaction: ChatInputCommandInteraction) {
		const userInput = interaction.options.getString('choices')!
		const choices = userInput.split(',').map(choice => choice.trim())! // Parse the list of choices provided by the user
		const rand = Math.floor(Math.random() * Math.floor(choices?.length!))

		const choiceEmbed = new EmbedBuilder()
			.setAuthor({iconURL: 'https://i.imgur.com/63S2bZB.png', name: 'Choices: ' + formatList(choices)})
			.setDescription(`<@${interaction.user.id}>, I choose **${String(choices[rand])}**`)
			.setColor('Blue')
		interaction.reply({embeds: [choiceEmbed]})
	}
}