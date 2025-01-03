import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { images } from '../index.js'

export const command = {
	data: new SlashCommandBuilder()
		.setName('image')
		.setDescription('Fetch a commonly referenced image')
		.addStringOption(option => 
			option
				.setName('image')
				.setDescription('The alias for the commonly referenced image')
				.setRequired(true)
				.addChoices(...images.map(img => ({name: img.get('name'), value: img.get('name')})))
		)
		.addUserOption(option => option.setName('target').setDescription('The user to mention with this command'))
	,
	async execute(interaction: ChatInputCommandInteraction) {
		const userInput = interaction.options.getString('image')!
		const targettedUser = interaction.options.getUser('target')!
        const image = images.find(img => img.get('name') === userInput)!

        const imgEmbed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle(image.get('name'))
            .setImage(image.get('value'))
            .setURL(image.get('value'))
		
        await interaction.reply({content: targettedUser ? `*Image for ${targettedUser}:*` : undefined, embeds: [imgEmbed]})
	}
}