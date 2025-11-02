import { MessageContextMenuCommandInteraction, ContextMenuCommandBuilder, MessageFlags } from 'discord.js'
import { BOT_ID } from '../../data/discord.js'
import { getPostModal } from '../../commandHelpers/postModal.js'

export const command = {
	data: new ContextMenuCommandBuilder()
		.setName('edit')
		.setType(3)
	,
	async execute(interaction: MessageContextMenuCommandInteraction) {
		if (interaction.targetMessage.author.id === BOT_ID) {
            interaction.showModal(getPostModal(interaction.targetMessage.content, interaction.targetMessage.id))
		} else {
            interaction.reply({
                content: 'You do not have permission to edit that message!',
                flags: MessageFlags.Ephemeral
            })
        }
	}
}