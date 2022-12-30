import { CommandInteraction, Interaction, MessageEmbed } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('minasc')
		.setDescription('Calculate your minimum ascension and talent caps')
		.addNumberOption(option => option.setName('ascension')
			.setDescription('Your Ascension')
			.setRequired(true)
			.setMinValue(1)
			.setMaxValue(50000))
		.addNumberOption(option => option.setName('floor')
			.setDescription('Your highest Onslaught Floor')
			.setRequired(true)
			.setMinValue(1)
			.setMaxValue(999))
	,
	async execute(interaction: CommandInteraction) {
		const ascInput = interaction.options.getNumber('ascension')!
		const floorInput = interaction.options.getNumber('floor')!
		const ascension = Math.round(ascInput)
		const floor = Math.round(floorInput)
		const user = interaction.member?.user

		let talentCaps = floor >= 30 ? (floor-30)*4.16 + ascension/50 : ascension/50
		const minAsc = Math.round(talentCaps * 3)
		const offense = minAsc%3 > 0 ? Math.floor(talentCaps) + 1 : Math.floor(talentCaps)
		const defense = minAsc%3 > 1 ? Math.floor(talentCaps) + 1 : Math.floor(talentCaps)
		const utility = Math.floor(talentCaps)
		talentCaps = Math.round(talentCaps)

		const suggestion = minAsc < 500
		? 'Your Minimum Ascension is far too low. If you reset right now, you will most likely not be able to get back to where you were or do many resets very easily.'
		: 500 <= minAsc && minAsc < 1000
		? "You're making progress towards resetting, but you should still continue to push higher in Onslaught before doing so."
		: 1000 <= minAsc && minAsc < 1500
		? 'You might have enough Minimum Ascension for your next reset now, but you should probably go even further still.'
		: 1500 <= minAsc && minAsc < 3000
		? "You have a good amount of Minimum Ascension now! If you want to reset now, I won't stop you, but you may want to consider pushing for 3000 Minimum Ascension."
		: minAsc > 3000
		? 'What are you waiting for? You have more than enough Minimum Ascension for your next reset!'
		: 'Hmm, it seems that your input is invalid, so I cannot provide a proper suggestion...'
		
		const ascEmbed = new MessageEmbed()
			.setColor('ORANGE')
			.setAuthor({name: (interaction as Interaction).user.tag})
			.setThumbnail(`https://cdn.discordapp.com/avatars/${user?.id}/${user?.avatar}.png`)
			.addField('**Ascension:**', `${ascension}`, true)
			.addField('**Floor:**', `${floor}`, true)
			.addField('**Talent Caps:**', `${talentCaps}`, true)
			.addField('**Minimum Ascension:**', `\`\`\`${minAsc} (${offense} Offense | ${defense} Defense | ${utility} Utility)\`\`\``)
			.addField('<:protobot:563244237433602048> My suggestion:', suggestion)
			.addField('\u200b', '[Click Here](https://wiki.dungeondefenders2.com/wiki/Ancient_Power_Calculations) to learn more about how this was calculated')
		
		await interaction.reply({embeds: [ascEmbed], allowedMentions: {repliedUser: false}})
	}
}