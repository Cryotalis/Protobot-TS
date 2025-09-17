import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'

export const command = {
	data: new SlashCommandBuilder()
		.setName('time')
		.setDescription('Display the current time in Gainesville, Florida')
	,
	async execute(interaction: ChatInputCommandInteraction) {
		const now = new Date()
        const options: Intl.DateTimeFormatOptions = {
            dateStyle: 'full',
            timeStyle: 'medium',
            timeZone: 'America/New_York',
        }
        const gainesvilleDateTime = new Intl.DateTimeFormat('en-US', options).format(now)

        interaction.reply(`It is currently \`${gainesvilleDateTime}\` in Gainesville, Florida.`)
    }
}