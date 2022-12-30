import { CommandInteraction, MessageEmbed } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import { images } from '../index'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('image')
		.setDescription('Fetch a commonly referenced image')
		.addStringOption(option => 
			option
				.setName('image')
				.setDescription('The alias for the commonly referenced image')
				.setRequired(true)
				.addChoices(images.map(({name}) => [name, name]))
		)
		.addUserOption(option => option.setName('target').setDescription('The user to mention with this command'))
	,
	async execute(interaction: CommandInteraction) {
		const userInput = interaction.options.getString('image')!
		const targettedUser = interaction.options.getUser('target')!
        const image = images.find(img => img.name === userInput)!

        const imgEmbed = new MessageEmbed()
            .setColor('ORANGE')
            .setTitle(image.name)
            .setImage(image.value)
            .setURL(image.value)
		
        await interaction.reply({content: targettedUser ? `*Image for ${targettedUser}:*` : null, embeds: [imgEmbed]})
	}
}