import { ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, EmbedBuilder, SlashCommandBuilder, ButtonStyle } from 'discord.js'
import { compareTwoStrings } from 'string-similarity'
import axios from 'axios'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('player')
		.setDescription('Search for a player on the leaderboard')
		.addStringOption(option =>
			option
				.setName('name')
				.setDescription('The name of the player you want to search for')
				.setRequired(true)
		)
	,
	async execute(interaction: ChatInputCommandInteraction) {
		return interaction.reply('This command has been indefinitely disabled.')
		// const playerName = interaction.options.getString('name')!
		// const searchEmbed = new EmbedBuilder()
		// 	.setTitle(`Searching for "${playerName}" <a:loading:763160594974244874>`)
		// 	.setAuthor({name: 'Player Finder', iconURL: 'https://leaderboard.dungeondefenders2.com/images/hero.png'})
		// 	.setFooter({text: 'https://leaderboard.dungeondefenders2.com/'})
		// 	.setColor('Blue')

		// await interaction.reply({embeds: [searchEmbed]})

        // const {data: {result}} = await axios.get(`https://dd2worker.dundef.workers.dev/?query=playerfinder&name=${playerName}`)
		// if (!result?.length) return interaction.editReply({content: 'No players were found.', embeds: []})
		// if (result.length === 1) return loadProfile(String(result[0].id))

		// interface player {id: number, name: string, updated: string}
		// const players = 
		// 	result
		// 		.sort((a: player, b: player) => Date.parse(b.updated) - Date.parse(a.updated))
		// 		.sort((a: player, b: player) => compareTwoStrings(b.name, playerName) - compareTwoStrings(a.name, playerName))

		// const playersEmbed = new EmbedBuilder()
		// 	.setTitle(`Found ${players.length} results for "${playerName}"`)
		// 	.setDescription('Select a player using the menu below.')
		// 	.setColor('Blue')

		// let pageNum = 0
		// const numbers = [ '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟' ]
		// const formattedPlayers = players.map((player: player) => `${numbers[players.indexOf(player)%10]} ${player.name} (${player.id})`)
		
		// function setPage(page: number){
		// 	const index = page*10
		// 	playersEmbed.fields = []
		// 	if (players.length > index) playersEmbed.addField('\u200b', formattedPlayers.slice(index, index + 5).join('\n\n'), true)
		// 	if (players.length > index + 5) playersEmbed.addField('\u200b', formattedPlayers.slice(index + 5, index + 10).join('\n\n'), true)

		// 	const navButtons = new ActionRowBuilder()
		// 		.addComponents(
		// 			new ButtonBuilder()
		// 				.setCustomId('leftButton')
		// 				.setLabel('🡰')
		// 				.setStyle(ButtonStyle.Primary)
		// 				.setDisabled(Boolean(page === 0))
		// 		)
		// 		.addComponents(
		// 			new ButtonBuilder()
		// 				.setCustomId('pageButton')
		// 				.setLabel(`ㅤㅤㅤㅤPage ${pageNum + 1}ㅤㅤㅤㅤ`)
		// 				.setStyle(ButtonStyle.Secondary)
		// 				.setDisabled(true)
		// 		)
		// 		.addComponents(
		// 			new ButtonBuilder()
		// 				.setCustomId('rightButton')
		// 				.setLabel('🡲')
		// 				.setStyle(ButtonStyle.Primary)
		// 				.setDisabled(Boolean(players.length <= index + 10))
		// 		)
		// 		.addComponents(
		// 			new ButtonBuilder()
		// 				.setCustomId('cancelButton')
		// 				.setLabel('✖')
		// 				.setStyle(ButtonStyle.Danger)
		// 		)

		// 	const playerMenu = new ActionRowBuilder()
		// 		.addComponents(
		// 			new MessageSelectMenu()
		// 				.setCustomId('Player Selector')
		// 				.setPlaceholder('Select a Player')
		// 				.addOptions(formattedPlayers.slice(index, index + 10).map((player: string) => ({label: player, value: player})))
		// 		)
		// 	interaction.editReply({embeds: [playersEmbed], components: [playerMenu, navButtons]})
		// }
		// setPage(0)

		// const playerCollector = interaction.channel?.createMessageComponentCollector({componentType: 'SELECT_MENU', filter: msg => msg.member?.user.id === interaction.member?.user.id, time: 60000*5, max: 1})
		// playerCollector?.on('collect', i => {
		// 	buttonCollector?.stop()
		// 	playerCollector.stop()
		// 	loadProfile(String(i.values[0].match(/(?<=\()\d+/)))
		// })
		
		// const buttonCollector = interaction.channel?.createMessageComponentCollector({componentType: 'BUTTON', filter: msg => msg.member?.user.id === interaction.member?.user.id, time: 60000*5})
		// buttonCollector?.on('collect', i => {
		// 	i.deferUpdate()
		// 	if (i.customId === 'leftButton') {pageNum--; setPage(pageNum)}
		// 	else if (i.customId === 'rightButton') {pageNum++; setPage(pageNum)}
		// 	else if (i.customId === 'cancelButton') {
		// 		buttonCollector.stop() 
		// 		interaction.editReply({content: 'Player Search cancelled.', embeds: [], components: []})
		// 		return
		// 	}
		// })

		// async function loadProfile(playerID: string){
		// 	const playerEmbed = new EmbedBuilder()
		// 		.setAuthor({name: 'Player Finder', iconURL: 'https://leaderboard.dungeondefenders2.com/images/hero.png'})
		// 		.setColor('Blue')
		// 		.setTitle('Loading Player Profile <a:loading:763160594974244874>')
		// 	interaction.editReply({embeds: [playerEmbed], components: []})

		// 	const {data: {result}} = await axios.get(`https://dd2worker.dundef.workers.dev/?query=player&id=${playerID}`)
		// 	interface board {board: string, data: number, moment: string, worldrank: number, platrank: number}
		// 	const nullResult: board = {board: '', data: 0, moment: '', worldrank: 0, platrank: 0}
		// 	const floor = result.other.find((board: board) => board.board === 'Onslaught') ?? nullResult
		// 	const stars = result.other.find((board: board) => board.board === 'Mastery') ?? nullResult
		// 	const power = result.other.find((board: board) => board.board === 'Power') ?? nullResult
		// 	const trades = result.other.find((board: board) => board.board === 'Trade') ?? nullResult

		// 	playerEmbed
		// 		.setAuthor({
		// 			name: `${result.name} (${result.id})`,
		// 			iconURL: `https://cdn.dundef.com/images/AP_${power.data > 75 ? 75 : power.data}.png`
		// 		})
		// 		.setTitle(`${result.name}'s Stats and Rankings:`)
		// 		.addField(`⛰️ Highest Floor (Rank ${floor.worldrank})`, String(floor.data), true)
		// 		.addField(`🌟 Mastery Stars (Rank ${stars.worldrank})`, String(stars.data), true)
		// 		.addField('\u200B', '\u200B', true)
		// 		.addField(`⚜️ Ancient Power (Rank ${power.worldrank})`, String(power.data), true)
		// 		.addField(`<:Trader:841728740282990612> High Value Trades (Rank ${trades?.worldrank})`, String(trades.data), true)
		// 		.addField('\u200B', '\u200B', true)
			
		// 	return interaction.editReply({embeds: [playerEmbed]})
		// }
	}
}