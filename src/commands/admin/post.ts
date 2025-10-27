import { ChatInputCommandInteraction, InteractionContextType, SlashCommandBuilder } from 'discord.js'
import { getPostModal } from '../../commandHelpers/postModal.js'

export const command = {
	data: new SlashCommandBuilder()
		.setName('post')
		.setDescription('Post a message to this channel through Protobot.')
		.setContexts(InteractionContextType.Guild)
	,
	async execute(interaction: ChatInputCommandInteraction) {
		interaction.showModal(getPostModal())
	}
}