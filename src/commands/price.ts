import { CommandInteraction, MessageEmbed } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import { findBestMatch } from 'string-similarity'
import { prices, mods } from '../index'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('price')
		.setDescription('Find recommended prices for an item in DD2')
		.addStringOption(option => option.setName('item').setDescription('The item you are looking for the price of').setRequired(true))
		.addNumberOption(option => option.setName('amount')
			.setDescription('An amount of items')
			.setMinValue(1))
		.addNumberOption(option => option.setName('quality')
			.setDescription('The quality of the mod, out of 10')
			.setMinValue(1)
			.setMaxValue(10))
		.addStringOption(option => option.setName('rarity')
			.setDescription('The rarity of the pet')
			.addChoices(['Legendary', 'Mythical', 'Epic', 'Powerful'].map(e => [e, e])))
	,
	async execute(interaction: CommandInteraction) {
		let amount = interaction.options.getNumber('amount')
		const qualibean = interaction.options.getNumber('quality') ?? 10 // Default to 10/10 if no quality was given
		let rarity = interaction.options.getString('rarity')
		let item = interaction.options.getString('item')!

		let itemPrefix = ""
		const chipType = item.match(/Chip|Servo/i)?.toString()

		if (/Medal|Mark|Orb|Totem/i.test(item)){item += '(Stats)'}
		const validPets = ['Katkarot', 'Shinobi Kitty', 'Table Flipper', 'Evilwick', 'Autumeow', 'G4-T0', 'Headless Horseman', 'Kobold King', 'Kobold Bling King', 'Jackalope', 'Corrupted Jackalope', 'Dino', 'Haunted Ship']
		const pcItemNames = prices.filter(i => i.pcPrice).map(i => i.pcItem)
		const psItemNames = prices.filter(i => i.psPrice).map(i => i.psItem)
		const xboxItemNames = prices.filter(i => i.xboxPrice).map(i => i.xboxItem)
		const pcPetNames = prices.filter(p => p.pcRarity !== '#N/A').map(p => p.pcItem)
		const psPetNames = prices.filter(p => p.psRarity !== '#N/A').map(p => p.psItem)
		const xboxPetNames = prices.filter(p => p.xboxRarity !== '#N/A').map(p => p.xboxItem)
		const allPetNames = pcPetNames.concat(psPetNames, xboxPetNames)
		let itemName = findBestMatch(item, pcItemNames.concat(psItemNames, xboxItemNames)).bestMatch.target
		if (!chipType && mods.find(mod => mod.name === itemName.replace('Chip', 'Servo'))){itemName = itemName.replace('Chip', 'Servo')} //If no mod type was given, default to Servo (assuming a servo version exists)
		if (/Pristine|Shiny|Plain/i.test(itemName) && !/Pristine|Shiny|Plain/i.test(item)){itemName = itemName.replace(/Shiny|Plain/i, 'Pristine')}
		const pcItem = prices.find(i => i.pcItem === itemName)
		const psItem = prices.find(i => i.psItem === itemName)
		const xboxItem = prices.find(i => i.xboxItem === itemName)

		function getPrice(price: string, platform: string){
			if (/^-$|^\?$|^∞$/.test(price)) return price
			if (/Tenacity/i.test(itemName) && qualibean !== 10) {itemPrefix = `${qualibean}/10 `; return 0}
			const numAbbreviations: {[key: string]: number} = {k: 1000, m: 1000000, b: 1000000000}
			const qualibeanMultiplier = [0, 0.001, 0.001, 0.001, 0.001, 0.001, 0.001, 0.001, 0.075, 0.15, 1]
			const multiplier: string = price.match(/k|m|b/i)?.toString()!
			let newMultiplier = "", priceArr
			priceArr = price.match(/[\d\.]+/g)?.map(p => parseFloat(p) * numAbbreviations[multiplier])!
			if (mods.find(mod => mod.name === itemName)){ //If the item is a mod
				priceArr = priceArr.map(p => p * qualibeanMultiplier[qualibean])
				itemPrefix = `${qualibean}/10 `
			} else if (allPetNames.includes(itemName)){ //If the item is a pet
				if (!rarity || !validPets.includes(itemName)){ //If a rarity was not provided or the pet does not have a lower rarity
					rarity = prices.find(p => p.pcItem === itemName)?.pcRarity ?? prices.find(p => p.psItem === itemName)?.psRarity ?? prices.find(p => p.xboxItem === itemName)?.xboxRarity
				} else {
					switch (platform){
						case 'PC': priceArr = priceArr.map(p => p * {Powerful: 0.1, Epic: 0.15, Mythical: 0.25, Legendary: 1}[rarity!]!); break
						case 'PS4': priceArr = priceArr.map(p => p * {Powerful: 0.15, Epic: 0.25, Mythical: 0.50, Legendary: 1}[rarity!]!); break
						case 'Xbox': priceArr = priceArr.map(p => p * {Powerful: 0.01, Epic: 0.05, Mythical: 0.1, Legendary: 1}[rarity!]!); break
					}
				}
				itemPrefix = `${rarity} `
			} else if (!/Mark|Orb|Medallion|Totem|Armor/i.test(itemName)){ //Lastly, if the item is not a Relic or Armor piece, then assume it is a Material
				if (!amount){amount = itemName.includes('(x1)') ? 1 : 99} //Defaults
				else {
					if (itemName.includes('(x1)')){
						priceArr = priceArr.map(p => p*amount!)
					} else if (amount){priceArr = priceArr.map(p => p/99*amount!)}
				}
				itemPrefix = `${amount}x `
			}

			priceArr = priceArr.map(p => {
				if (p >= 1000 && p < 1000000){newMultiplier = 'k'; return parseFloat((p /= 1000).toFixed(1))}
				if (p >= 1000000 && p < 1000000000){newMultiplier = 'm'; return parseFloat((p /= 1000000).toFixed(1))}
				if (p >= 1000000000){newMultiplier = 'b'; return parseFloat((p /= 1000000000).toFixed(1))}
			})
			return priceArr.join('-') + newMultiplier + (/\+/.test(price) ? '+' : "")
		}

		const pcPrice = pcItem ? getPrice(pcItem.pcPrice, 'PC') : '-'
		const psPrice = psItem ? getPrice(psItem.psPrice, 'PS4') : '-'
		const xboxPrice = xboxItem ? getPrice(xboxItem.xboxPrice, 'Xbox') : '-'
		itemName = itemName.replace(' (x1)', "")

		const priceEmbed = new MessageEmbed()
			.setColor('ORANGE')
			.setAuthor({name: 'Price Check', url: 'https://docs.google.com/spreadsheets/d/1GXtKq58mLDBWbhTlUhOj4GbMmJ37MZf2D8rnDHHl_R8'})
			.setTitle(`Showing Prices for ${itemPrefix + itemName}:`)
			.addField('<:Windows:841728740333715497>  PC Price', `${pcPrice} <:gold:460345588911833088>`)
			.addField('<:PS:841728740282597426>  PlayStation Price', `${psPrice} <:gold:460345588911833088>`)
			.addField('<:Xbox:841728740303437824>  Xbox Price', `${xboxPrice} <:gold:460345588911833088>`)
			.addField('\u200b', 'Prices taken from [DD2 Market Prices](https://docs.google.com/spreadsheets/d/1GXtKq58mLDBWbhTlUhOj4GbMmJ37MZf2D8rnDHHl_R8)')
		await interaction.reply({embeds: [priceEmbed]})
	}
}