import { CommandInteraction, MessageEmbed } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription("Shows a link to Protobot's website and Support Discord Server")
	,
	async execute(interaction: CommandInteraction) {
		const helpEmbed = new MessageEmbed()
			.setColor('ORANGE')
			.setTitle('Protobot Command List')
			.setDescription('The complete list of commands for Protobot can be found [here](https://cryotalis.github.io/Protobot/commands.html)')
			.setThumbnail('https://i.imgur.com/GkZIG4R.png')
			.addField('\u200b','If you want to talk to my creator about anything, please join the [support server](https://discord.gg/YtwzVSp).')
    	return interaction.reply({embeds: [helpEmbed]})
	}
}