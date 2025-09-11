import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'

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
		
		// Calculate time difference
		// TODO: Time difference should be calculated with a util function
		let timeDiff = (nextDate.getTime() - now.getTime()) / 1000
		const dayDiff = Math.floor(timeDiff / 86400)
		timeDiff -= dayDiff * 86400
		const hourDiff = Math.floor(timeDiff / 3600)
		timeDiff -= hourDiff * 3600
		const minDiff = Math.floor(timeDiff / 60)
		timeDiff -= minDiff * 60
		const secDiff = Math.floor(timeDiff)
		
		nextDate.setMinutes(nextDate.getMinutes() - nextDate.getTimezoneOffset()) // Convert back to local time
		
		const weekNum = Math.floor((now.getTime() - TIMESTAMP) / 8.64e+7 / 7 % 4) // 8.64e+7 = 1 day
		const rotationImages = [
			'https://i.imgur.com/pMJ8J5X.png',
			'https://i.imgur.com/r19VbPW.png',
			'https://i.imgur.com/4mHTFMv.png',
			'https://i.imgur.com/GXBplZd.png'
		]
		const DFKMods = ['Torchbearer', 'Frozen Path', 'Frostfire Remnants', 'Drakenlord\'s Soul']
		DFKMods[weekNum] = `**${DFKMods[weekNum]}**`

		const DFKEmbed = new EmbedBuilder()
			.setColor('Blue')
			.setTitle('__**Time until next rotation:**__')
			.setThumbnail('https://i.imgur.com/BrTSxJu.png')
			.addFields([
				{
					name: `\u200B    ${dayDiff}           ${hourDiff}            ${minDiff}             ${secDiff}`,
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
			.setImage(rotationImages[weekNum])

		interaction.reply({ embeds: [DFKEmbed] })
	}
}