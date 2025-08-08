import { MessageContextMenuCommandInteraction, ContextMenuCommandBuilder, MessageFlags } from 'discord.js'
import { database } from '../database/index.js'
import { botID } from '../index.js'

export const command = {
	data: new ContextMenuCommandBuilder()
		.setName('delete')
		.setType(3)
	,
	async execute(interaction: MessageContextMenuCommandInteraction) {
		const isBotMessage = interaction.targetMessage.author.id === botID
		const isContributor = database.contributors.find(u => u.get('id') === interaction.user.id)
		/** Whether the target message is the result of a command issued by the user. */
		const isOGCommandUser = interaction.user === interaction.targetMessage.interactionMetadata?.user

		let msgContent: string
		if (isBotMessage && (isContributor || isOGCommandUser)) {
			msgContent = 'Message deleted.'
			await interaction.targetMessage.delete()
		} else {
			msgContent = 'You do not have permission to delete that message!'
		}

		interaction.reply({content: msgContent, flags: MessageFlags.Ephemeral})
		
	}
}