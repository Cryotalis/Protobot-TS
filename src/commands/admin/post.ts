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
			.setRequired(false)

		const postContentInput = new TextInputBuilder()
			.setCustomId('postContent')
			.setLabel('Enter the contents for your post')
			.setStyle(TextInputStyle.Paragraph)

		const modal = new ModalBuilder()
			.setCustomId('postModal')
			.setTitle('Post a Message')
			.addComponents(
				new ActionRowBuilder<TextInputBuilder>().addComponents(messageIDInput),
				new ActionRowBuilder<TextInputBuilder>().addComponents(postContentInput),
			)
		
		interaction.showModal(modal)
	}
}