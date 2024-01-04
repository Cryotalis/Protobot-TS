import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { faq } from '../index'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('faq')
		.setDescription('Fetch an answer to a frequently asked question')
		.addStringOption(option =>
			option
				.setName('faq')
				.setDescription('The alias for the frequently asked question')
				.setRequired(true)
				.addChoices(...faq.map(faq => ({name: faq.get('name'), value: faq.get('name')})))
		)
		.addUserOption(option => option.setName('target').setDescription('The user to mention with this command'))
	,
	async execute(interaction: ChatInputCommandInteraction) {
		const userInput = interaction.options.getString('faq')!
		const targettedUser = interaction.options.getUser('target')!
		await interaction.reply((targettedUser ? `*Answer for ${targettedUser}:*\n` : '') + faq.find(faq => faq.get('name') === userInput)?.get('value'))
	}
}