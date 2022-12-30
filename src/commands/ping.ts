import { CommandInteraction } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription("Show Protobot's response time")
	,
	async execute(interaction: CommandInteraction) {
		const time = Date.now()
		await interaction.reply('Pinging <a:loading:763160594974244874>')
		await interaction.editReply(`Pong! - Time: **${time - interaction.createdTimestamp}ms**`)
	}
}