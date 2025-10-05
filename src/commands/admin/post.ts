import { ActionRowBuilder, ChatInputCommandInteraction, InteractionContextType, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from 'discord.js'

export const command = {
	data: new SlashCommandBuilder()
		.setName('post')
		.setDescription('Post a message to this channel through Protobot.')
		.setContexts(InteractionContextType.Guild)
	,
	async execute(interaction: ChatInputCommandInteraction) {
		const messageIDInput = new TextInputBuilder()
			.setCustomId('messageID')
			.setLabel('Enter a message ID (to edit a post instead)')
			.setStyle(TextInputStyle.Short)
			.setMaxLength(30)
			.setRequired(false)

		const postContentInput = new TextInputBuilder()
			.setCustomId('textContent')
			.setLabel('Enter the text content for your post')
			.setStyle(TextInputStyle.Paragraph)
			.setMaxLength(2000)
			.setRequired(false)
		
		const imagesInput = new TextInputBuilder()
			.setCustomId('imageLinks')
			.setLabel('Enter image links separated by commas')
			.setStyle(TextInputStyle.Paragraph)
			.setRequired(false)

		const modal = new ModalBuilder()
			.setCustomId('postModal')
			.setTitle('Post a Message')
			.addComponents(
				new ActionRowBuilder<TextInputBuilder>().addComponents(messageIDInput),
				new ActionRowBuilder<TextInputBuilder>().addComponents(postContentInput),
				new ActionRowBuilder<TextInputBuilder>().addComponents(imagesInput),
			)
		
		interaction.showModal(modal)
	}
}