import { CommandInteraction, MessageEmbed } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import { capFirstLetter } from '../library'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ask')
		.setDescription('Ask Protobot a yes or no question')
		.addStringOption(option => option.setName('question').setDescription("The question you'd like to know the answer to").setRequired(true))
	,
	async execute(interaction: CommandInteraction) {
		const question = capFirstLetter(interaction.options.getString('question')!)
		const yesAnswers = ['Yes', 'Without a doubt', 'Yes, definitely', 'Most Likely', 'Signs point to yes', 'Certainly', 'As I see it, yes']
		const noAnswers = ['No', 'Definitely not', 'Probably', 'Signs point to no', 'As I see it, no']
		const answers = yesAnswers.concat(noAnswers)
		const rand = Math.floor(Math.random() * Math.floor(answers.length))

		const answerEmbed = new MessageEmbed()
			.setAuthor({iconURL: 'https://i.imgur.com/0wLgnwS.png', name: 'Question: ' + question + (/\?$/.test(question) ? '' : '?')})
			.setDescription(`<@${interaction.user.id}> ${answers[rand]}`)
			.setColor('BLUE')
		await interaction.reply({embeds: [answerEmbed]})
	}
}