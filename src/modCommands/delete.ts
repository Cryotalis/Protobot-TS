import { Message, MessageContextMenuInteraction } from 'discord.js'
import { ContextMenuCommandBuilder } from '@discordjs/builders'
import { councilMemberTags } from '..'

module.exports = {
	data: new ContextMenuCommandBuilder()
		.setName('delete')
		.setType(3)
	,
	async execute(interaction: MessageContextMenuInteraction) {
		if (!councilMemberTags.includes(interaction.user.tag)) return interaction.reply({content: 'Only Protobot Council members may use this command.', ephemeral: true})
		if (interaction.targetMessage.author.id !== '521180443958181889') return interaction.reply({content: "This command can only delete Protobot's messages!", ephemeral: true})
		await (interaction.targetMessage as Message).delete()
		await interaction.reply('Message deleted').then(() => interaction.deleteReply())
	}
}