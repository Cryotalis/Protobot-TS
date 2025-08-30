import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { sendToChannel } from '../utils/discord.js'
import { BOT_OWNER_ID } from '../data/discord.js'

export const command = {
	data: new SlashCommandBuilder()
		.setName('say')
		.setDescription('Send a message to a channel')
        .addStringOption(option => option.setName('channel').setDescription('The ID of the channel to send a message to').setRequired(true))
		.addStringOption(option => option.setName('message').setDescription('The message to send').setRequired(true))
	,
	async execute(interaction: ChatInputCommandInteraction) {
		if (interaction.user.id !== BOT_OWNER_ID) return

        const channelID = interaction.options.getString('channel')!
		const message = interaction.options.getString('message')!
        
		interaction.reply(`Message sent to <#${channelID}>.`)
        
		sendToChannel(channelID, message)
	}
}