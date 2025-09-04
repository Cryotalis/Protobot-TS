import { MessageContextMenuCommandInteraction, ContextMenuCommandBuilder, MessageFlags } from 'discord.js'
import { BOT_ID } from '../data/discord.js'
import { isContributor } from '../database/helpers.js'

export const command = {
	data: new ContextMenuCommandBuilder()
		.setName('delete')
		.setType(3)
	,
	async execute(interaction: MessageContextMenuCommandInteraction) {
		const isBotMessage = interaction.targetMessage.author.id === BOT_ID
		/** Whether the target message is the result of a command issued by the user. */
		const isOGCommandUser = interaction.user === interaction.targetMessage.interactionMetadata?.user

		let msgContent: string
		if (isBotMessage && (isContributor(interaction.user.id) || isOGCommandUser)) {
			msgContent = 'Message deleted.'
			await interaction.targetMessage.delete()
		} else {
			msgContent = 'You do not have permission to delete that message!'
		}

		interaction.reply({content: msgContent, flags: MessageFlags.Ephemeral})
		
	}
}