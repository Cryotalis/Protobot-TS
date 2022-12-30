import { CommandInteraction } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
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
				.addChoices(faq.map(({name}) => [name, name]))
		)
		.addUserOption(option => option.setName('target').setDescription('The user to mention with this command'))
	,
	async execute(interaction: CommandInteraction) {
		const userInput = interaction.options.getString('faq')!
		const targettedUser = interaction.options.getUser('target')!
		await interaction.reply((targettedUser ? `*Answer for ${targettedUser}:*\n` : '') + faq.find(faq => faq.name === userInput)?.value)
	}
}