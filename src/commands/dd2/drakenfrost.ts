import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { dateDiff } from '../../utils/time.js'
import { MILLISECONDS } from '../../data/time.js'
import { DFKIcon, DFKRotationImages } from '../../data/assets.js'

export const command = {
	data: new SlashCommandBuilder()
		.setName('drakenfrost')
		.setDescription('Show the weapons and mods that are currently in rotation in Drakenfrost Keep')
	,
	async execute(interaction: ChatInputCommandInteraction) {
		// Drakenfrost Keep rotation changes on Tuesdays at 5AM (UTC)
		const TIMESTAMP = 1554786000000 // April 9th, 2019, 5am UTC, used as a reference to calculate week number
		const now = new Date()
		now.setMinutes(now.getMinutes() + now.getTimezoneOffset()) // Ensure that UTC is being used
		
		const nextDate = new Date( // Gets the next Tuesday at 5AM (UTC)
			now.getUTCFullYear(),
			now.getUTCMonth(),
			now.getUTCDate() + (9 - now.getUTCDay()) % 7,
			5, 0, 0, 0
		)
		if (nextDate <= now) nextDate.setDate(nextDate.getDate() + 7)
		
		const { days, hours, minutes, seconds } = dateDiff(nextDate, now)
		
		nextDate.setMinutes(nextDate.getMinutes() - nextDate.getTimezoneOffset()) // Convert back to local time
		
		const weekNum = Math.floor((now.getTime() - TIMESTAMP) / MILLISECONDS.WEEK % 4)
		const DFKMods = ['Torchbearer', 'Frozen Path', 'Frostfire Remnants', 'Drakenlord\'s Soul']
		DFKMods[weekNum] = `**${DFKMods[weekNum]}**`

		const DFKEmbed = new EmbedBuilder()
			.setColor('Blue')
			.setTitle('__**Time until next rotation:**__')
			.setThumbnail(`attachment://${DFKIcon.name}`)
			.addFields([
				{
					name: `\u200B    ${days}           ${hours}            ${minutes}             ${seconds}`,
					value: 'Days \u2009 Hours \u2009 Minutes \u2009 Seconds\n\u200B '
				},
				{ name: 'Week 1', value: DFKMods[0], 	   inline: true },
				{ name: 'Week 2', value: DFKMods[1], 	   inline: true },
				{ name: '\u200b', value: '\u200b', 		   inline: true },
				{ name: 'Week 3', value: DFKMods[2], 	   inline: true },
				{ name: 'Week 4', value: DFKMods[3], 	   inline: true },
				{ name: '\u200b', value: `\u200b\n\u200b`, inline: true },
				{ name: '**Next Rotation At**:', value: `<t:${nextDate.getTime()/1000}:F>`}
			])
			.setImage(`attachment://${DFKRotationImages[weekNum].name}`)

		interaction.reply({
			embeds: [DFKEmbed],
			files: [
				DFKIcon,
				DFKRotationImages[weekNum]
			]
		})
	}
}