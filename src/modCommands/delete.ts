import { Message, MessageContextMenuCommandInteraction, ContextMenuCommandBuilder } from 'discord.js'
import { database } from '../database/index.js'
import { botID } from '../index.js'

export const command = {
	data: new ContextMenuCommandBuilder()
		.setName('delete')
		.setType(3)
	,
	async execute(interaction: MessageContextMenuCommandInteraction) {
		if (!database.contributors.find(u => u.get('id') === interaction.user.id)) return interaction.reply({content: 'Only Protobot Council members may use this command.', ephemeral: true})
		if (interaction.targetMessage.author.id !== botID) return interaction.reply({content: 'You do not have permission to delete that message!', ephemeral: true})
		await (interaction.targetMessage as Message).delete()
		interaction.reply({content: 'Message deleted.', ephemeral: true})
	}
}