import { CommandInteraction, MessageEmbed } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rate')
		.setDescription('Calculate the rating of an item')
		.addStringOption(option => option.setName('your-stat').setDescription('The current stat of your item').setRequired(true))
		.addStringOption(option => option.setName('max-stat').setDescription('The maximum stat of your item').setRequired(true))
		.addStringOption(option => option.setName('min-stat').setDescription('The minimum stat of your item').setRequired(false))
	,
	async execute(interaction: CommandInteraction) {
        const stat = parseFloat(interaction.options.getString('your-stat')!)
        const maxStat = parseFloat(interaction.options.getString('max-stat')!)
        const minStat = parseFloat(interaction.options.getString('min-stat')!)

        let rating = 0
        let ratingEmbed = new MessageEmbed()
            .setTitle('Item Rating Calculator')
            .setColor('ORANGE')
            .addField('Your Stat:', String(stat), true)

        if (!minStat){
            ratingEmbed.setDescription('You are currently using the **shorthand** item rating.\nFormula: `Your Stat/Max Stat`')
            rating = stat/maxStat
            ratingEmbed.addField('Max Stat:', String(maxStat), true)
        } else {
            ratingEmbed.setDescription('You are currently using the **in game** item rating.\nFormula: `(Your Stat - Min Stat)/(Max Stat - Min Stat)`')
            rating = (stat - minStat)/(maxStat - minStat)
            ratingEmbed.addField('Stat Range:', `${minStat}~${maxStat}`, true)
        }

        ratingEmbed.addField('Item Rating:', `${(rating*100).toFixed(2)}%`)

        return await interaction.reply({embeds: [ratingEmbed]})
	}
}