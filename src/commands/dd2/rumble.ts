import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { dateDiff } from '../../utils/time.js'
import { rumbleIcon, rumbleRotationImages } from '../../data/assets.js'

export const command = {
	data: new SlashCommandBuilder()
		.setName('rumble')
		.setDescription('Show what items are available from Elemental Rumble this week')
	,
	async execute(interaction: ChatInputCommandInteraction) {
		// Rumble rotation changes on Wednesday at 0:00 (UTC)
		const TIMESTAMP = 1756857600000 // September 3rd, 2025, 0:00 UTC, used as a reference to calculate week number
		const now = new Date()
		now.setMinutes(now.getMinutes() + now.getTimezoneOffset()) // Ensure that UTC is being used
		
		const nextDate = new Date( // Gets the next Wednesday at 0:00 (UTC)
			now.getUTCFullYear(),
			now.getUTCMonth(),
			now.getUTCDate() + (10 - now.getUTCDay()) % 7,
			0, 0, 0, 0
		)
		if (nextDate <= now) nextDate.setDate(nextDate.getDate() + 7)
		
		const { days, hours, minutes, seconds } = dateDiff(nextDate, now)
		
		nextDate.setMinutes(nextDate.getMinutes() - nextDate.getTimezoneOffset()) // Convert back to local time

		const weekNum = Math.floor((now.getTime() - TIMESTAMP) / 8.64e+7 / 7 % 4) // 8.64e+7 = 1 day
		const weekNames = ['Fire', 'Water', 'Storm', 'Earth'].map(n => n + ' Week')
		weekNames[weekNum] = `**${weekNames[weekNum]}**`
	
		const rumbleEmbed = new EmbedBuilder()
			.setColor('Blue')
			.setTitle('__**Time until next rotation:**__')
			.setThumbnail(`attachment://${rumbleIcon.name}`)
			.addFields([
				{
					name: `\u200B    ${days}           ${hours}            ${minutes}             ${seconds}`,
					value: 'Days \u2009 Hours \u2009 Minutes \u2009 Seconds\n\u200B '
				},
				{ name: 'Week 1', value: weekNames[0], 	   inline: true },
				{ name: 'Week 2', value: weekNames[1], 	   inline: true },
				{ name: '\u200b', value: '\u200b', 		   inline: true },
				{ name: 'Week 3', value: weekNames[2], 	   inline: true },
				{ name: 'Week 4', value: weekNames[3], 	   inline: true },
				{ name: '\u200b', value: `\u200b\n\u200b`, inline: true },
				{ name: '**Next Rotation At**:', value: `<t:${nextDate.getTime()/1000}:F>`}
			])
			.setImage(`attachment://${rumbleRotationImages[weekNum].name}`)

		interaction.reply({
			embeds: [rumbleEmbed],
			files: [
				rumbleIcon,
				rumbleRotationImages[weekNum]
			]
		})
	}
}