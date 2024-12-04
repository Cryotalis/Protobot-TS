import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { prices, mods } from '../index.js'
import { findBestCIMatch } from '../library.js'
import { processItem } from '../modules/price.js'
import { rarityName } from '../data/database.js'

export const command = {
	data: new SlashCommandBuilder()
		.setName('price')
		.setDescription('Find recommended prices for an item in DD2')
		.addStringOption(option => option
			.setName('item')
			.setDescription('The item you are looking for the price of')
			.setRequired(true)
		)
		.addNumberOption(option => option
			.setName('quality')
			.setDescription('The quality of the mod, out of 10')
			.setMinValue(1)
			.setMaxValue(10)
		)
		.addNumberOption(option => option
			.setName('amount')
			.setDescription('An amount of items')
			.setMinValue(1)
		)
		.addStringOption(option => option
			.setName('rarity')
			.setDescription('The rarity of the pet')
			.addChoices(['Legendary', 'Mythical', 'Epic', 'Powerful'].map(e => ({ name: e, value: e })))
		)
	,
	async execute(interaction: ChatInputCommandInteraction) {
		const amount = interaction.options.getNumber('amount') ?? undefined
		const qualibean = interaction.options.getNumber('quality') ?? 10 // Default to 10/10 if no quality was given
		const rarity = interaction.options.getString('rarity') as rarityName ?? undefined
		const searchItem = interaction.options.getString('item')!
		
		let bestMatch = findBestCIMatch(searchItem, prices.map(i => i.get('name'))).bestMatch.target

		// If no mod type was given, default to Servo if a Servo variant exists
		if (!/Chip|Servo/i.test(searchItem) && mods.find(mod => mod.get('name') === bestMatch.replace('Chip', 'Servo'))) {
			bestMatch = bestMatch.replace('Chip', 'Servo')
		}

		const itemResult = prices.find(i => i.get('name') === bestMatch)!
		const { name, pcPrice, psPrice, xboxPrice } = processItem(itemResult, amount, qualibean, rarity)

		const priceEmbed = new EmbedBuilder()
			.setColor('Blue')
			.setAuthor({ name: 'Price Check' })
			.setTitle(`Showing Prices for ${name}:`)
			.addFields([
				{ name: '<:Windows:841728740333715497>  PC Price', value: `${pcPrice} <:gold:460345588911833088>` },
				{ name: '<:PS:841728740282597426>  PlayStation Price', value: `${psPrice} <:gold:460345588911833088>` },
				{ name: '<:Xbox:841728740303437824>  Xbox Price', value: `${xboxPrice} <:gold:460345588911833088>` },
				{ name: '\u200b', value: 'Prices taken from [DD2 Market Prices](https://docs.google.com/spreadsheets/d/1GXtKq58mLDBWbhTlUhOj4GbMmJ37MZf2D8rnDHHl_R8)' }
			])

		interaction.reply({ embeds: [priceEmbed] })
	}
}