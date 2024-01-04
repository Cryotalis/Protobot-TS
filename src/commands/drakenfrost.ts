import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('drakenfrost')
		.setDescription('Show the weapons and mods that are currently in rotation in Drakenfrost Keep')
	,
	async execute(interaction: ChatInputCommandInteraction) {
		const nextDate = new Date()
		const today = new Date()
		const theDay = new Date(1554786000000) // April 9th, 2019, 5am UTC
		
		today.setMinutes(today.getMinutes() + new Date().getTimezoneOffset()) // Ensure that UTC is being used
		nextDate.setMinutes(nextDate.getMinutes() + new Date().getTimezoneOffset()) // Ensure that UTC is being used
		nextDate.setDate(nextDate.getDate() + (9-nextDate.getDay())%7)
		nextDate.setHours(5)
		nextDate.setMinutes(0, 0, 0)

		if (nextDate.valueOf() <= today.valueOf()) {nextDate.setDate(nextDate.getDate() + 7)} // Add a week if nextDate is in the past
		let timeDiff = (nextDate.valueOf() - today.valueOf()) / 1000 // Time difference between next Monday at 5AM UTC and now in seconds
		const week = Math.floor((today.valueOf() - theDay.valueOf()) / 8.64e+7 / 7 % 4) // 8.64e+7 = 1 day

		//Calculates time difference
		const diffDays = Math.floor(timeDiff / 86400)
		timeDiff -= diffDays * 86400
		const diffHours = Math.floor(timeDiff / 3600)
		timeDiff -= diffHours * 3600
		const diffMins = Math.floor(timeDiff / 60)
		timeDiff -= diffMins * 60
		const diffSecs = Math.floor(timeDiff)
		
		const Img = ['https://i.imgur.com/pMJ8J5X.png', 'https://i.imgur.com/r19VbPW.png', 'https://i.imgur.com/4mHTFMv.png', 'https://i.imgur.com/GXBplZd.png'][week]
		const DFKMods = ['Torchbearer', 'Frozen Path', 'Frostfire Remnants', "Drakenlord's Soul"]
		DFKMods[week] = `**${DFKMods[week]}**`
		nextDate.setMinutes(nextDate.getMinutes() - new Date().getTimezoneOffset()) // Convert the UTC time back to local time

		const DFKEmbed = new EmbedBuilder()
			.setColor('Blue')
			.setTitle('__**Time until next rotation:**__')
			.setThumbnail('https://i.imgur.com/BrTSxJu.png')
			.addFields([
				{name: '\u200B    ' + diffDays + '           ' + diffHours + '            ' + diffMins + '             ' + diffSecs, value: 'Days \u2009 Hours \u2009 Minutes \u2009 Seconds\n\u200B '},
				{name: 'Week 1', value: DFKMods[0], inline: true},
				{name: 'Week 2', value: DFKMods[1], inline: true},
				{name: '\u200b', value: '\u200b', inline: true},
				{name: 'Week 3', value: DFKMods[2], inline: true},
				{name: 'Week 4', value: DFKMods[3], inline: true},
				{name: '\u200b', value: `\u200b\n\u200b`, inline: true},
				{name: '**Next Rotation At**:', value: `<t:${nextDate.getTime()/1000}:F>`}
			])
			.setImage(Img)

		await interaction.reply({embeds: [DFKEmbed]})
	}
}