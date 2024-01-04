import { ChannelType, Client, Collection, EmbedBuilder, GatewayIntentBits, Message, ModalActionRowComponent, REST, Routes, TextChannel, TextInputComponent, User } from 'discord.js'
import { GoogleSpreadsheet, GoogleSpreadsheetRow } from 'google-spreadsheet'
import { schedule } from 'node-cron'
import { inspect } from 'util'
import parse from 'node-html-parser'
import fs from 'node:fs'
import Parser from 'rss-parser'
import axios from 'axios'
import { abbreviateAllNumbers, capFirstLetter, capitalize, dateToString, getAbbreviatedNumber, getDirectImgurLinks, getNumber, getTwitchAccessToken, getTwitchUserInfo, streamInfo, timeToUnix, userInfo } from './library'
import { registerFont } from 'canvas'
import { JWT } from 'google-auth-library'

export const client: Client<boolean> & {commands?: Collection<unknown, unknown>} = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages], rest: {timeout: 60000}})

registerFont(require('@canvas-fonts/arial'), {family: 'Arial'})
registerFont(require('@canvas-fonts/arial-bold'), {family: 'Arial Bold'})

const privateCommandFiles = ['run.js', 'say.js']
const gameCommandNames = ['defense', 'drakenfrost', 'faq', 'image', 'link', 'listmods', 'listshards', 'minasc', 'mod', 'price', 'rate', 'shard', 'wiki']

export const regCommands = fs.readdirSync('./prod/commands').filter(file => file.endsWith('.js'))
export const modCommands = fs.readdirSync('./prod/modCommands').filter(file => file.endsWith('.js'))
const commandFiles = regCommands.concat(modCommands)

export async function registerCommands() {
	const commands = []
	const privateCommands = [] // Administrator level commands only usable by privileged users
	const commandInfo = [] // Contains name, type, and description for each command, for use with the Database and website
	client.commands = new Collection()

	for (const file of commandFiles) {
		const command = regCommands.includes(file) ? require(`./commands/${file}`) : require(`./modCommands/${file}`)
		if (privateCommandFiles.includes(file)) privateCommands.push(command.data.toJSON())
		else {
			commands.push(command.data.toJSON())
			commandInfo.push([
				command.data.name, 
				command.data.description, 
				gameCommandNames.includes(command.data.name) 
					? 'game' 
					: modCommands.includes(`${command.data.name}.js`) 
						? 'moderator' 
						: 'regular'
			])
		}
		client.commands.set(command.data.name, command)
	}

	for (const command of commandInfo) { // Custom command descriptions for context commands, for use in the Database and the website
		if (/delete/.test(command[0])) {
			command[1] = 'Deletes Protobot messages. Reserved for Protobot Council members only'
			command[2] += ' context'
		}
		if (/translate text/.test(command[0])) {
			command[1] = 'Translates text to your own language'
			command[2] += ' context'
		}
	}

	await publicDB.sheetsByTitle['Commands'].clearRows()
	await publicDB.sheetsByTitle['Commands'].addRows(commandInfo)

	const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN!)
	rest.put(Routes.applicationCommands('521180443958181889'), { body: commands })
		.then(() => console.log('Successfully registered application commands globally'))
		.catch(console.error)

	rest.put(Routes.applicationGuildCommands('521180443958181889', '379501550097399810'), { body: privateCommands })
}

// Connecting to the Database
export let publicDB: GoogleSpreadsheet
export let privateDB: GoogleSpreadsheet

export let defenseBuilds: GoogleSpreadsheet
export let defenseImages: Array<GoogleSpreadsheetRow>

export let auctions: Array<GoogleSpreadsheetRow>
export let userLogs: Array<GoogleSpreadsheetRow>
export let youtubeChannels: Array<GoogleSpreadsheetRow>
export let twitchChannels: Array<GoogleSpreadsheetRow>
export let variables: Array<GoogleSpreadsheetRow>
export let blacklist: Array<GoogleSpreadsheetRow>
export let blacklistedIDs: Array<string>

export let shards: Array<GoogleSpreadsheetRow>
export let mods: Array<GoogleSpreadsheetRow>
export let prices: Array<GoogleSpreadsheetRow>
export let images: Array<GoogleSpreadsheetRow>
export let faq: Array<GoogleSpreadsheetRow>
export let links: Array<GoogleSpreadsheetRow>
export let contributors: Array<GoogleSpreadsheetRow>
export let councilMemberIDs: Array<string>

// Connecting to CG Bug Reporting Sheet
export let bugReportDoc: GoogleSpreadsheet
export let ddgrReports: Array<GoogleSpreadsheetRow>
export let ddaReports: Array<GoogleSpreadsheetRow>
export let dd2Reports: Array<GoogleSpreadsheetRow>

const serviceAccountAuth = new JWT({
	email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
	key: process.env.GOOGLE_PRIVATE_KEY,
	scopes: ['https://www.googleapis.com/auth/spreadsheets']
})
export async function connectToDB () {
    publicDB = new GoogleSpreadsheet('1yOjZhkn9z8dJ8HMD0YSUl7Ijgd9o1KJ62Ecf4SgyTdU', serviceAccountAuth)
    privateDB = new GoogleSpreadsheet(process.env.PRIVATE_DB_ID!, serviceAccountAuth)
	await Promise.all([publicDB.loadInfo(), privateDB.loadInfo()])

	;[
		userLogs,
		youtubeChannels,
		twitchChannels,
		variables,
		blacklist,
		shards,
		mods,
		prices,
		images,
		faq,
		links,
		contributors,
	] = await Promise.all([
		privateDB.sheetsByTitle['User Logs'].getRows(),
		privateDB.sheetsByTitle['Youtube Post Notifications'].getRows(),
		privateDB.sheetsByTitle['Twitch Live Notifications'].getRows(),
		privateDB.sheetsByTitle['Variables'].getRows(),
		privateDB.sheetsByTitle['Blacklist'].getRows(),
		publicDB.sheetsByTitle['Shards'].getRows(),
		publicDB.sheetsByTitle['Mods'].getRows(),
		publicDB.sheetsByTitle['Prices'].getRows(),
		publicDB.sheetsByTitle['Images'].getRows(),
		publicDB.sheetsByTitle['FAQ'].getRows(),
		publicDB.sheetsByTitle['Links'].getRows(),
		publicDB.sheetsByTitle['Contributors'].getRows(),
	])
	councilMemberIDs = contributors.map(contributor => contributor.get('id'))
	blacklistedIDs = blacklist.map(user => user.get('id'))

	console.log('Database connection successful')
}
connectToDB().then(() => registerCommands())

export let defenseBuildData: defenseObject[] = []
export interface defenseObject {name: string, role: string, tertiary: string, shards: string[], mods: {name: string, qualibean: string}[], relic: string}
export async function loadDefenseBuilds(){
	defenseBuilds = new GoogleSpreadsheet('1sjBA60Fr9ryVnw4FUIMU2AVXbKw395Tdz7j--EAUA1A', serviceAccountAuth)
    await defenseBuilds.loadInfo()
	defenseImages = await defenseBuilds.sheetsByTitle['Data'].getRows()

	let buildData: defenseObject[] = []
	for (let i = 2; i < defenseBuilds.sheetCount-2; i++){
		let sheet = defenseBuilds.sheetsByIndex[i]
		await sheet.loadCells()

		for (let y = 2; y < sheet.rowCount; y += 20){
			if (y >= sheet.rowCount) continue
			for (let x = 1; x < sheet.columnCount; x += 5){
				if (x >= sheet.columnCount || !sheet.getCell(y + 1, x + 2).value) continue
				buildData.push({
					name: sheet.getCell(y + 1, x + 2).value?.toString() ?? '',
					role: sheet.getCell(y + 4, x + 2).value?.toString() ?? '',
					tertiary: sheet.getCell(y + 5, x + 2).value?.toString() ?? '',
					shards: [
						sheet.getCell(y + 6, x + 2).value?.toString() ?? '',
						sheet.getCell(y + 8, x + 2).value?.toString() ?? '',
						sheet.getCell(y + 10, x + 2).value?.toString() ?? ''
					],
					mods: [
						{name: sheet.getCell(y + 12, x + 2).value?.toString() ?? '', qualibean: sheet.getCell(y + 12, x + 1).formula?.match(/\d+/)?.toString() || "0"}, 
						{name: sheet.getCell(y + 14, x + 2).value?.toString() ?? '', qualibean: sheet.getCell(y + 14, x + 1).formula?.match(/\d+/)?.toString() || "0"}, 
						{name: sheet.getCell(y + 16, x + 2).value?.toString() ?? '', qualibean: sheet.getCell(y + 16, x + 1).formula?.match(/\d+/)?.toString() || "0"}
					],
					relic: sheet.getCell(y + 12, x).formula?.match(/(?<=").+(?=")/)?.toString() || ""
				})
			}
		}	
	}
	defenseBuildData = buildData
	console.log('Defense Build Data compiled')
}
loadDefenseBuilds()

export let logChannel: TextChannel
export let errorChannel: TextChannel
export let modQueue: TextChannel
client.on('ready', async () => {
	client.user?.setActivity('/help')
	
	logChannel = client.channels.cache.get('577636091834662915') as TextChannel
	errorChannel = client.channels.cache.get('936833258149281862') as TextChannel
	modQueue = client.channels.cache.get('791527921142988832') as TextChannel

	console.log('Protobot is now online')
	logChannel?.send('**:white_check_mark:  Protobot is now online**')

	setInterval(() => (client.channels.cache.get('762948660983496715') as TextChannel).edit({name: `Server Count: ${client.guilds.cache.size}`}), 1.8e+6) // Every half an hour
})

// Slash Command Handler
client.on('interactionCreate', interaction => {
    if ((!interaction.isCommand() && !interaction.isMessageContextMenuCommand()) || !interaction.channel) return
	if (blacklistedIDs?.includes(interaction.user.id)) {interaction.reply(`${interaction.user} you have been banned running commands.`); return}

	const isModCommand = modCommands.includes(`${interaction.commandName}.js`)
    const command: any = client.commands?.get(interaction.commandName)
	if (!command) {interaction.reply({content: 'Failed to load command. Please try again in a few seconds.', ephemeral: true}); return}
	if (isModCommand && !(interaction.memberPermissions?.has('ManageMessages') || councilMemberIDs?.includes(interaction.user.id))){
		interaction.reply({content: 'You do not have permission to use this command.', ephemeral: true}); return
	} 

	try {
		command.execute(interaction)
	} catch (error) {
		console.error(error)
		errorChannel.send({
			content: `🚫  **${interaction.user.tag}** ran the ${isModCommand ? 'mod ' : ''}command \`${interaction.commandName}\` in **${interaction.guild?.name ?? 'Direct Messages'}** (${interaction.guildId ?? interaction.channelId})`,
			files: [{attachment: Buffer.from(inspect(error, {depth: null}), 'utf-8'), name: 'error.ts'}]
		})
		interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
	} finally {
		logChannel?.send(`:scroll:  **${interaction.user.tag}** ran the ${isModCommand ? 'mod ' : ''}command \`${interaction.commandName}\` in **${interaction.guild?.name ?? 'Direct Messages'}** (${interaction.guildId ?? interaction.channelId})`)
	}
})

// Message Command Handler, for testing only
// const prefix = 'dd!'
// client.on('messageCreate', (message: Message) => {
// 	if (message.author.id !== '251458435554607114' || message.author.bot || !message.content.startsWith(prefix)) return

// 	const args = message.content.slice(prefix.length).trim().split(' ')
// 	const command: string = args?.shift()?.toLowerCase()!
 
// 	try {
// 		const commands = require(`./messageCommands/${command}.js`)
// 		commands.run(client, message, prefix, args)
// 	} catch (error) {
// 		console.error(error)
// 		errorChannel.send({
// 			content: `🚫  **${message.author.tag}** ran the command \`${command}\` in **${message.guild?.name ?? 'Direct Messages'}** (${message.guildId ?? message.channelId})`,
// 			files: [new MessageAttachment(Buffer.from(inspect(error, {depth: null}), 'utf-8'), 'error.ts')]
// 		})
// 		message.channel.send('There was an error while executing this command!')
// 	} finally {
// 		logChannel?.send(`:scroll:  **${message.author.tag}** ran the command \`${command}\` in **${message.guild?.name ?? 'Direct Messages'}** (${message.guildId ?? message.channelId})`)
// 	}
// })

// Looking-For-Trade Chat Automod (Dungeon Defenders Server only)
let AMLogChannel: TextChannel // The channel to send log messages to (Auto Mod Log Channel)
client.on('ready', async () => {AMLogChannel = client.channels.cache.get('916495567037816853') as TextChannel})

const tradeRules = '1. Follow the trading format below.\n2. One trade per line, no more than 1 image per message.\n3. Do not discuss trades here. See market-discussion.\n4. If a trade has been completed, delete or edit the original post.\n5. Do not post advertisements more than once every 23 hours.\n\n[**H**] = **Have**\n[**W**] = **Want**\nYou must include one of the above in your listing!\n\nExample Trades:\n[H]  99 Pristine Motes   [W] 3m <:gold:460345588911833088>\n[W] 99 Shiny Motes   [H] 3m <:gold:460345588911833088>\n\nTrade Format(copy & paste):\n```[H] item-name  [W] :gold:\n[W] item-name  [H] :gold:```'
client.on('messageCreate', async (message: Message) => {
	const LFTAutomodChannels = ['460339922231099402', '460340670960500737', '460340942990475264'] // The channels that should be automodded
	if (message.channel.type === ChannelType.DM || !LFTAutomodChannels.includes(message.channelId) || !AMLogChannel || message.author.bot || !userLogs) {return}

	function createDelMsgEmbed(reason: string){
		if (!message.content){message.content = 'No Content'}
		return new EmbedBuilder()
			.setColor('Red')
			.setAuthor({name: `${message.author.tag}  |  ${user.warnings} Warnings`, iconURL: message.author.displayAvatarURL({extension: 'png'})})
			.setDescription(`Message sent by ${message.author} deleted in ${message.channel}`)
			.addFields([
				{name: 'Content', value: message.content.length > 1024 ? `${message.content.slice(0, 1020)}...` : message.content},
				{name: 'Reason', value: `Trade Channel Rule Violation: ${reason}`}
			])
			.setFooter({text: `Author: ${message.author.id} | Message ID: ${message.id}`})
			.setTimestamp(new Date())
	}

	function DMRules(violation: string){
		const dmEmbeds = [
			new EmbedBuilder().setColor('Blue').setTitle('Looking-For-Trade Channel Rules:').setDescription(tradeRules),
			new EmbedBuilder().setColor('Blue').setTitle("Here's what you posted:").setDescription(`\`\`\`${message.content}\`\`\``)
		]
		if (violation.includes('23')){dmEmbeds.push(new EmbedBuilder().setColor('Blue').setDescription(`You may post again after <t:${Date.parse(user.time)/1000 + 8.28e+4}>`))}
		message.author.send({content: `${violation} Please review the Looking-For-Trade channel rules here:`, embeds: dmEmbeds})
	}
	
	const user: any = userLogs.find(user => user.get('authorID') === message.author.id) || {lastMsgID: '', authorID: '', time: new Date(message.createdTimestamp).toString(), warnings: 0}
	if (user.authorID !== "" && new Date(message.createdTimestamp).getTime() - Date.parse(user.time) < 8.28e+7){ //If the user is logged and their last message was within 23 hours, send a warning
		try{
			message.delete()
			DMRules('You cannot post more than once per 23 hours!')
			user.warnings ++
			AMLogChannel.send({embeds: [createDelMsgEmbed('23 Hour Rule')]})
		} catch (e){}
	} else if (!/\[W\]|\[H\]|WTB|WTS/i.test(message.content)){ //If the message does not conform to the formatting rules, send a warning
		try{
			message.delete()
			DMRules('Your Looking-For-Trade post did not follow the correct format!')
			user.time = ""
			user.warnings ++
			AMLogChannel.send({embeds: [createDelMsgEmbed('Formatting')]})
		} catch (e){}
	} else { //If no warnings were given, log the timestamp
		user.time = new Date(message.createdTimestamp).toString()
	}

	user.lastMsgID = message.id
	user.authorID = `'${message.author.id}`
	if (!userLogs.find(user => user.get('authorID') === message.author.id)){
		user.authorTag = message.author.tag
		await privateDB.sheetsByTitle['User Logs'].addRow(user)
		userLogs = await privateDB.sheetsByTitle['User Logs'].getRows()
	} else {await user.save()}
})

// Youtube Post Notifications
schedule('* * * * *', () => {
	if (!youtubeChannels) return
	youtubeChannels.forEach(async channel => {
		const discordChannel = client.channels.cache.get(channel.get('discordChannelID')) as TextChannel
		const feed = await new Parser().parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${channel.get('youtubeID')}`).catch(() => undefined) // Parse the RSS Feed for the channel, ignore any 404 errors if the rss feed is unavailable
		if (!feed) return

		const newVideo = feed.items[0] // The most recently published video
		const recentVideos: string[] = channel.get('recentVideos') ? JSON.parse(channel.get('recentVideos')) : []
		if (recentVideos.includes(newVideo.link!)) return

		const {data} = await axios.get(newVideo.link!)
		if (/Scheduled\sfor/i.test(data)) return // Do not post if this is a scheduled stream (the user has not gone live)
		if (/watching\snow/i.test(data)){
			discordChannel.send(`${newVideo.author} is now live!\n${newVideo.link}`)
		} else {
			discordChannel.send(`${newVideo.author} has uploaded a new video!\n${newVideo.link}`)
		}
		if (recentVideos.length >= 5) recentVideos.shift() // Only store the 5 most recent videos
		recentVideos.push(newVideo.link!)
		channel.set('recentVideos', JSON.stringify(recentVideos)) // Store the video so that it doesn't get posted again
		channel.save()
		
	})
})

// Twitch Live Notifications
export interface channelConfig {id: string, message: string | null, categories: string[]}
schedule('* * * * *', () => {
	if (!twitchChannels) return
	twitchChannels.forEach(async channel => {
		const configs: channelConfig[] = JSON.parse(channel.get('configs') || '[]')
		if (configs.length === 0) return
		const [streamInfo, userInfo] = await Promise.all([
			getTwitchUserInfo(channel.get('username'), 1) as unknown as streamInfo,
			getTwitchUserInfo(channel.get('username'), 0) as unknown as userInfo
		])
		if (!streamInfo || !userInfo) return
		const recentStreamIDs: string[] = JSON.parse(channel.get('recentStreamIDs') || '[]')
		if (recentStreamIDs.includes(streamInfo.id)) return

		const twitchStreamEmbed = new EmbedBuilder()
			.setAuthor({name: 'Twitch', iconURL: 'https://cdn.icon-icons.com/icons2/3041/PNG/512/twitch_logo_icon_189242.png'})
			.setTitle(`${streamInfo.user_name} is now playing ${streamInfo.game_name}!`)
			.setURL(`https://www.twitch.tv/${channel.get('username')}`)
			.setDescription(streamInfo.title)
			.setThumbnail(userInfo.profile_image_url)
			.setColor('Purple')

		configs.forEach((config: channelConfig) => {
			const discordChannel = client.channels.cache.get(config.id) as TextChannel
			discordChannel.send({content: config.message!, embeds: [twitchStreamEmbed]})
		})

		if (recentStreamIDs.length >= 5) recentStreamIDs.shift() // Only store the 5 most recent stream IDs
		recentStreamIDs.push(streamInfo.id)
		channel.set('recentStreamIDs', JSON.stringify(recentStreamIDs)) // Store the stream ID so that it doesn't get posted again
		channel.save()
	})
})

// DD2 Wiki Changes
schedule('* * * * *', async () => {
	interface wikiChange {title: string, user: string, comment: string, timestamp: string, type: string, logaction: string, logtype: string, rcid: number, revid: number, logparams: {target_title: string, img_sha1: string}}
	function getAction(change: wikiChange){
		let action = ''
		
		if (change.type === 'log'){
			switch(change.logaction){
				case 'overwrite': 	action = 'Overwrote'; break
				case 'rights': 		action = 'Changed User Rights for'; break
				default: 			action = change.logaction.replace(/e$/, '') + 'ed'
			}
		} else {
			action = change.type === 'edit' ? 'Edited' : 'Created'
		}

		action += ` "${change.title}"`

		if (change.logaction === 'move') action += ` to "${change.logparams.target_title}"`
		if (change.logtype === 'newusers') action = 'Created an Account'

		return capFirstLetter(action)
	}

	const wikiChangesChannel = client.channels.cache.get('1072236073515745451') as TextChannel
	const response = await axios.get('https://wiki.dungeondefenders2.com/api.php?action=query&list=recentchanges&rcprop=user|title|timestamp|comment|loginfo|ids&rclimit=5&format=json')
    const {data: {query: {recentchanges}}} = response
	const recentChangeIDsInfo = variables.find(v => v.get('name') === 'recentChangeIDs')!
	const recentChangeIDs = JSON.parse(recentChangeIDsInfo.get('value') || '[]')
	const changes: wikiChange[] = recentchanges.reverse()

	for (const change of changes){
		if (recentChangeIDs.includes(change.rcid)) continue
		recentChangeIDs.push(change.rcid)
		const url = `https://wiki.dungeondefenders2.com/index.php?title=${change.title}&diff=${change.revid}`.replace(/\s/g, '_')
		const wikiChangeEmbed = new EmbedBuilder()
			.setAuthor({name: change.user, url: `https://wiki.dungeondefenders2.com/wiki/User:${change.user.replace(/\s/g, '_')}`})
			.setTitle(`${change.user} ${getAction(change)}`)
			.setURL(`https://wiki.dungeondefenders2.com/wiki/${change.title.replace(/\s/g, '_')}`)
			.addFields({name: 'Comment', value: change.comment || 'No Comment Provided'})
			.setColor('Blue')
			.setTimestamp(Date.parse(change.timestamp))

		if (change.type === 'edit'){
			const document = parse((await axios.get(url)).data)
			const removed = document.querySelectorAll('.diff-deletedline').map(e => `- ${e.textContent}`).join('\n')
			const added = document.querySelectorAll('.diff-addedline').map(e => `+ ${e.textContent}`).join('\n')
			if (removed) wikiChangeEmbed.addFields({name: 'Removed', value: '```diff\n' + (removed.length > 950 ? `${removed.substring(0, 950)}\n- and more...` : removed) + '```'})
			if (added) wikiChangeEmbed.addFields({name: 'Added', value: '```diff\n' + (added.length > 950 ? `${added.substring(0, 950)}\n+ and more...` : added) + '```'})
		} else if (change.logparams?.img_sha1){
			const document = parse((await axios.get(url)).data)
			const imgURL = document.querySelector('img')!.getAttribute('src')!
			if (!/poweredby_mediawiki/.test(imgURL)) wikiChangeEmbed.setImage(`https://wiki.dungeondefenders2.com${imgURL}`)
		}

		wikiChangesChannel.send({embeds: [wikiChangeEmbed]})
	}
	if (recentChangeIDsInfo.get('value') === JSON.stringify(recentChangeIDs.slice(-10))) return
	recentChangeIDsInfo.set('value', JSON.stringify(recentChangeIDs.slice(-10))) // Store the recent change IDs to prevent duplicates
	await recentChangeIDsInfo.save()
})

// Handle modals
// interface auctionBid {bidder: string, bid: string, status: string, timestamp: string}
// client.on('interactionCreate', async interaction => {
// 	if (!interaction.isModalSubmit() || (interaction.user.id === '251458435554607114' && botSettings.developerMode)) return

// 	// Handle Auction Creation
// 	if (interaction.customId === 'Auction Modal'){
// 		const title = interaction.fields.getTextInputValue('Title')
// 		const description = interaction.fields.getTextInputValue('Description')
// 		let minBid = interaction.fields.getTextInputValue('Minimum Bid')
// 		if (!(minBid.includes('gold') || /^[\d\s.]+(?:[tbmk]{1})?$/i.test(minBid))) return interaction.reply({content: 'Setting the minimum bid to a non-gold value is currently not supported.', ephemeral: true})
// 		if (/^[\d\s.]+(?:[tbmk]{1})?$/i.test(minBid)) minBid += ' gold'
// 		minBid = abbreviateAllNumbers(minBid)
// 		const duration = interaction.fields.getTextInputValue('Duration')
// 		if (timeToUnix(duration) < 3600000 || timeToUnix(duration) > 604800000) return interaction.reply({content: 'Auction duration cannot be lower than 1 hour or greater than 7 days.', ephemeral: true})
// 		const endDate = new Date(new Date().getTime() + timeToUnix(duration))
// 		const links = interaction.fields.getTextInputValue('Links')
// 		const parsedLinks = (links && /https?:\/\/.+?(?=$|http)/.test(links)) ? links.match(/https?:\/\/.+?(?=$|http)/gm)! : ['']
// 		const imgurLinks = parsedLinks.filter(link => link.includes('imgur.com'))
// 		if (imgurLinks) imgurLinks.forEach(async link => {
// 			parsedLinks.splice(parsedLinks.indexOf(link), 1)
// 			parsedLinks.push(...await getDirectImgurLinks(link))
// 		})

// 		const channelLink = `https://discord.com/channels/${interaction.guildId}/${interaction.channelId!}`
// 		const auctionEmbed = new EmbedBuilder()
// 			.setAuthor({name: `Auction by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({format: 'png'})})
// 			.setTitle(`${title}`)
// 			.setDescription(description)
// 			.addField('Minimum Bid:', minBid.replace(/gold/ig, '<:gold:460345588911833088>'), true)
// 			.addField('Top Bidder:', 'None', true)
// 			.addField('Time Remaining:', `Ends <t:${Math.ceil(endDate.getTime()/1000)}:R>`, true)
// 			.setColor('Blue')
// 			.setURL(channelLink)
// 			.setFooter({text: 'Ends'})
// 			.setTimestamp(endDate)
		
// 		const embedArray = [auctionEmbed]
// 		if (parsedLinks){
// 			for (let i = 0; i < parsedLinks.length; i++){
// 				if (i > 3) break // Limit to 4 images
// 				if (!parsedLinks[i]) continue
// 				if (!auctionEmbed.image) {auctionEmbed.setImage(parsedLinks[i]); continue}
// 				const auctionImageEmbed = new EmbedBuilder()
// 					.setURL(channelLink)
// 					.setImage(parsedLinks[i])
// 					.setColor('Blue')
// 				embedArray.push(auctionImageEmbed)
// 			}
// 		}

// 		const auctionInputs = new ActionRowBuilder()
// 			.addComponents(
// 				new ButtonBuilder()
// 					.setCustomId('Auction Bid Button')
// 					.setLabel(`Place Bid`)
// 					.setStyle(ButtonStyle.Primary)
// 			)
// 			.addComponents(
// 				new ButtonBuilder()
// 					.setCustomId('Retract Bid Button')
// 					.setLabel(`Retract Bid`)
// 					.setStyle('DANGER')
// 			)
// 			.addComponents(
// 				new ButtonBuilder()
// 					.setCustomId('Cancel Auction Button')
// 					.setLabel(`Cancel Auction`)
// 					.setStyle('DANGER')
// 			)
		
// 		let DMSuccess = true
// 		const userMessage = await interaction.user.send({content: "You've started an auction! Here's an overview:"}).catch(() => {
// 			DMSuccess = false
// 			interaction.reply({content: 'You must enable direct messages to start an auction!', ephemeral: true})
// 		})
// 		if (!DMSuccess) return

// 		const auctionMessage = await interaction.reply({embeds: embedArray, components: [auctionInputs], fetchReply: true}) as Message
// 		const auctionOverviewEmbed = new EmbedBuilder()
// 			.setAuthor({name: `Auction by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({format: 'png'})})
// 			.setTitle(`${title}`)
// 			.setDescription(description)
// 			.addField('Minimum Bid:', minBid.replace(/gold/ig, '<:gold:460345588911833088>'), true)
// 			.addField('Time Remaining:', `Ends <t:${Math.ceil(endDate.getTime()/1000)}:R>`, true)
// 			.addField('Direct Link:', `[Click Here](${channelLink}/${auctionMessage.id})`, true)
// 			.setColor('Blue')
// 			.setURL(`${channelLink}/${auctionMessage.id}`)
// 			.setFooter({text: 'Ends'})
// 			.setTimestamp(endDate)
// 		await (userMessage as Message).edit({embeds: [auctionOverviewEmbed]})

// 		const auction = await privateDB.sheetsByTitle['Auctions'].addRow({
// 			auctioneerID: interaction.user.id,
// 			auctionID: auctionMessage.id,
// 			title: title,
// 			startDate: new Date().toString(),
// 			endDate: endDate.toString(),
// 			bids: JSON.stringify([{bidder: null, bid: minBid, status: 'Accepted', timestamp: new Date().toString()}]),
// 			status: 'Running'
// 		})
// 		auctions.push(auction)

// 		scheduleJob(endDate, async function(msgID: string, channelID: string){
// 			const message = await client.channels.fetch(channelID).then(channel => (channel as TextChannel).messages.fetch(msgID))
// 			const auctionEntry = auctions.find(entry => entry.auctionID === message.id)!
// 			const auctionBids: auctionBid[] = JSON.parse(auctionEntry.bids).filter((bid: auctionBid) => bid.status === 'Accepted')
// 			const topBid = auctionBids.reverse()[0]
// 			auctionEntry.status = 'Concluded'
// 			await auctionEntry.save()

// 			const auctionEmbed = message.embeds[0]
// 			auctionEmbed.fields[2].value = 'Ended'
// 			auctionEmbed.setFooter({text: 'Ended'})
// 			auctionEmbed.setColor('RED')
// 			auctionEmbed.setTimestamp(null)
// 			await message.edit({embeds: [auctionEmbed], components: []})

// 			client.users.fetch(auctionEntry.auctioneerID).then(async user => {
// 				const auctionWinner = await client.users.fetch(topBid.bidder)
// 				const auctionEndEmbed = new EmbedBuilder()
// 					.setTitle('Auction Concluded')
// 					.setDescription(`Your auction for [${auctionEntry.title}](${auctionEmbed.url}/${message.id}) has ended! Contact the winner to set up the transaction!`)
// 					.addField('Winner:', `<@${topBid.bidder}> (${auctionWinner.tag})`)
// 					.addField('Winning bid:', topBid.bid)
// 					.setURL(`${auctionEmbed.url}/${message.id}`)
// 					.setColor('Blue')

// 				const auctionFailEmbed = new EmbedBuilder()
// 					.setTitle('Auction Concluded')
// 					.setDescription(`Your auction for [${auctionEntry.title}](${auctionEmbed.url}/${message.id}) has ended, but no bids were placed.`)
// 					.setURL(`${auctionEmbed.url}/${message.id}`)
// 					.setColor('Blue')
// 				user.send({embeds: [topBid.bidder ? auctionEndEmbed : auctionFailEmbed]})
// 			})

// 			if (!topBid?.bidder) return
// 			const auctioneer = await client.users.fetch(auctionEntry.auctioneerID)
// 			const auctionWinEmbed = new EmbedBuilder()
// 				.setDescription(`You won an auction by ${auctioneer} (${auctioneer.tag}) for [${auctionEntry.title}](${auctionEmbed.url}/${message.id})! Contact them to set up the transaction!`)
// 				.setColor('Blue')
// 			client.users.fetch(topBid.bidder).then(user => user.send({embeds: [auctionWinEmbed]}))
// 		}.bind(null, auctionMessage.id, auctionMessage.channelId))
// 	}

// 	// Auction Bids
// 	if (interaction.customId === 'Auction Bid Modal'){
// 		const auction = (interaction.message as Message)
// 		const auctionEntry = auctions.find(entry => entry.auctionID === auction.id)!
// 		const auctionBids: auctionBid[] = JSON.parse(auctionEntry.bids)
// 		const filteredBids = auctionBids.filter((bid: auctionBid) => bid.status === 'Accepted' || bid.status === 'Pending')
// 		const currentBid = filteredBids[filteredBids.length - 1] ?? auctionBids[0]
// 		let incomingBid = interaction.fields.getTextInputValue('Auction Bid')
// 		if (/^[\d\s.]+(?:[tbmk]{1})?$/i.test(incomingBid)) incomingBid += ' gold'
// 		let bidStatus: string

// 		// Determines whether or not the bid is an amount of gold and nothing else
// 		const onlyGold = (bid: string | number) => /^[\d\s.]+(?:[tbmk]{1})?\s?gold$/i.test(String(bid).trim())

// 		if (onlyGold(currentBid.bid) && onlyGold(incomingBid)){
// 			const minBid = getNumber(currentBid.bid) * 1.1
// 			const maxBid = getNumber(currentBid.bid) * 10
// 			if (getNumber(incomingBid) > maxBid) return interaction.reply({content: `You cannot bid more than 10x the current top bid!`, ephemeral: true})
// 			if (getNumber(incomingBid) < minBid && currentBid.bidder){
// 				return interaction.reply({content: `To outbid the current top bidder, you must bid at least ${minBid} (${getAbbreviatedNumber(minBid)}) gold!`, ephemeral: true})
// 			}
// 			if (getNumber(incomingBid) < getNumber(currentBid.bid)) {
// 				return interaction.reply({content: `You must bid at least ${getNumber(currentBid.bid)} (${getAbbreviatedNumber(getNumber(currentBid.bid))}) gold!`, ephemeral: true})
// 			}
// 			auction.embeds[0].fields[0].name = 'Top Bid:'
// 			auction.embeds[0].fields[0].value = abbreviateAllNumbers(incomingBid).replace(/gold/i, '<:gold:460345588911833088>')
// 			auction.embeds[0].fields[1].value = String(interaction.user)
// 			await auction.edit({embeds: [auction.embeds[0]]})
// 			bidStatus = 'Accepted'
// 			if (currentBid.bidder && interaction.user.id !== currentBid.bidder){
// 				const outbidEmbed = new EmbedBuilder()
// 					.setDescription(`You have been outbid in the auction for [${auctionEntry.title}](${auction.embeds[0].url}/${auction.id})!`)
// 					.setColor('Blue')
// 				client.users.fetch(currentBid.bidder).then(user => user.send({embeds: [outbidEmbed]}))
// 			}
// 			interaction.reply({content: 'Bid successful!', ephemeral: true})
// 		} else {
// 			// Do something else here
// 			bidStatus = 'Pending'
// 			return interaction.reply({content: 'Bidding with items other than gold is not currently supported.', ephemeral: true})
// 		}

// 		const userBid = filteredBids.find((bid: auctionBid) => bid.bidder === interaction.user.id)
// 		if (userBid) auctionBids.splice(auctionBids.indexOf(userBid), 1, {...userBid, status: 'Replaced'})
// 		auctionBids.push({
// 			bidder: interaction.user.id,
// 			bid: incomingBid,
// 			status: bidStatus,
// 			timestamp: new Date().toString()
// 		})
// 		const auctionIndex = auctions.indexOf(auctionEntry)
// 		auctionEntry.bids = JSON.stringify(auctionBids)
// 		auctions.splice(auctionIndex, 1, auctionEntry)
// 		auctionEntry.save()
// 	}
// })

// Handle Buttons
// client.on('interactionCreate', async interaction => {
// 	if (!interaction.isButton() || (interaction.user.id === '251458435554607114' && botSettings.developerMode)) return

// 	if (interaction.customId === 'Auction Bid Button'){
// 		const auctionEntry = auctions.find(entry => entry.auctionID === interaction.message.id)!
// 		const filteredBids: auctionBid[] = JSON.parse(auctionEntry.bids).filter((bid: auctionBid) => bid.status === 'Accepted' || bid.status === 'Pending')
// 		if (interaction.user.id === auctionEntry.auctioneerID) return interaction.reply({content: 'You cannot bid on your own auction!', ephemeral: true})
// 		if (interaction.user.id === filteredBids.reverse()[0].bidder) return interaction.reply({content: 'You are already the top bidder!', ephemeral: true})
// 		if (new Date() > new Date(auctionEntry.endDate)) return interaction.reply({content: 'This auction has already ended!', ephemeral: true})

// 		const bidModal = new Modal()
// 			.setCustomId(`Auction Bid Modal`)
// 			.setTitle('Place a Bid')
		
// 		const bid = new ActionRowBuilder<ModalActionRowComponent>().addComponents(
// 			new TextInputComponent()
// 				.setCustomId('Auction Bid')
// 				.setLabel('Your Bid')
// 				.setStyle('SHORT')
// 				.setMaxLength(100)
// 				.setRequired(true)
// 		)

// 		bidModal.addComponents(bid)
// 		await interaction.showModal(bidModal)
// 	}

// 	if (interaction.customId === 'Retract Bid Button'){
// 		const auction = (interaction.message as Message)
// 		const auctionEntry = auctions.find(entry => entry.auctionID === auction.id)!
// 		const auctionBids: auctionBid[] = JSON.parse(auctionEntry.bids)
// 		const filteredBids = auctionBids.filter(bid => bid.status === 'Accepted' || bid.status === 'Pending')
// 		if (filteredBids.filter(bid => bid.bidder === interaction.user.id && bid.status === 'Retracted').length > 2){ // Limit of 2 retractions per user per auction
// 			return interaction.reply({content: 'You can no longer retract any more bids in this auction.', ephemeral: true})
// 		}
// 		const userBid = filteredBids.find((bid: auctionBid) => bid.bidder === interaction.user.id)
// 		const endDate = new Date(auctionEntry.endDate)
// 		if (new Date() > endDate) return interaction.reply({content: 'This auction has already ended!', ephemeral: true})
// 		if (!userBid) return interaction.reply({content: 'You currently have no bids to retract!', ephemeral: true})
// 		if ((endDate.getTime() - new Date().getTime() < 3.6e+6) || (new Date().getTime() - new Date(userBid.timestamp).getTime() > 1.8e+6)){ // If there is less than 1 hour left in the auction or the bid was placed more than 30 minutes ago
// 			return interaction.reply({content: 'Your bid can no longer be retracted at this time.', ephemeral: true})
// 		}
		
// 		auctionBids.splice(auctionBids.indexOf(userBid), 1, {...userBid, status: 'Retracted', timestamp: new Date().toString()})
// 		const auctionIndex = auctions.indexOf(auctionEntry)
// 		auctionEntry.bids = JSON.stringify(auctionBids)
// 		auctions.splice(auctionIndex, 1, auctionEntry)
// 		await auctionEntry.save()

// 		const prevHighestBid = auctionBids.reverse().find(bid => bid.status !== 'Retracted') ?? auctionBids[auctionBids.length - 1]
// 		auction.embeds[0].fields[0].value = abbreviateAllNumbers(prevHighestBid.bid).replace(/gold/i, '<:gold:460345588911833088>')
// 		auction.embeds[0].fields[1].value = prevHighestBid.bidder ? `<@${prevHighestBid.bidder}>` : 'None'
// 		await auction.edit({embeds: [auction.embeds[0]]})
// 		interaction.reply({content: 'Bid retracted.', ephemeral: true})
// 	}

// 	if (interaction.customId === 'Cancel Auction Button'){
// 		const auction = interaction.message
// 		const auctionEntry = auctions.find(entry => entry.auctionID === interaction.message.id)!
// 		const filteredBids: auctionBid[] = JSON.parse(auctionEntry.bids).filter((bid: auctionBid) => bid.status === 'Accepted' || bid.status === 'Pending')
// 		const topBid = filteredBids[filteredBids.length - 1]
// 		if (new Date() > auctionEntry.endDate) return interaction.reply({content: 'This auction has already ended!', ephemeral: true})
// 		if (!(interaction.user.id === auctionEntry.auctioneerID || interaction.memberPermissions?.has('MANAGE_MESSAGES'))){
// 			return interaction.reply({content: 'You do not have permission to cancel this auction.', ephemeral: true})
// 		}
// 		if ((new Date((interaction.message as Message).createdTimestamp).getTime() - new Date().getTime() > 3600000) && !interaction.memberPermissions?.has('MANAGE_MESSAGES')){
// 			return interaction.reply({content: 'You cannot cancel an auction after it has been running for over an hour.', ephemeral: true})
// 		}
// 		(interaction.message as Message).delete()
		
// 		const auctionIndex = auctions.indexOf(auctionEntry)
// 		auctionEntry.status = 'Cancelled'
// 		auctions.splice(auctionIndex, 1, auctionEntry)
// 		await auctionEntry.save()
// 		const cancelledEmbed = new EmbedBuilder()
// 			.setDescription(`The auction for [${auctionEntry.title}](${auction.embeds[0].url}/${auction.id}) has been cancelled.`)
// 			.setColor('Blue')
// 		if (topBid?.bidder) client.users.fetch(topBid.bidder).then(user => user.send({embeds: [cancelledEmbed]}))
// 		interaction.reply({content: 'Auction cancelled.', ephemeral: true})
// 	}
// })

client.on('messageCreate', async (message: Message) => {
	if (message.channelId !== '343306253587709952') return
	// if (message.embeds[0]?.fields[0]?.name === 'Account Age' && timeToUnix(message.embeds[0].fields[0].value) <= 604800000){
	// 	const newMemberEmbed = new EmbedBuilder()
	// 		.setColor('Blue')
	// 		.setTitle('New Account Joined')
	// 		.setDescription(message.embeds[0].description!)
	// 		.addField('Account Age', message.embeds[0].fields[0].value)
	// 		.setFooter(message.embeds[0].footer)
	// 		.setTimestamp(message.embeds[0].timestamp)
	// 	modQueue.send({content: `Take Action? (${message.embeds[0].description?.match(/<@\d+>/)})`, embeds: [newMemberEmbed]})
	// }
	if (message.embeds[0]?.description?.includes('was given the roles `Livestream Notification`, `Promo & Event Notifications`, `DD1 Update`, `DDGR`, `DD2 Update`, `DDA Update`, `PS4`, `Update Notifications`, `DD1`, `DD2`, `Survey Notifications`, `Giveaways`, `DDA`, `PC`, `Trader`, `DDGR Update`, `Switch`, `Xbox`, `ImABot`')){
		const targetUserID = message.embeds[0]?.description.match(/\d+/)![0]
		const targetMember = await client.guilds.cache.get('98499414632448000')?.members.fetch(targetUserID)
		await targetMember?.roles.set(['1097974123625451572'], 'Suspected Bot Account')
		const susMemberEmbed = new EmbedBuilder()
			.setColor('Red')
			.setTitle('Suspected Bot Account Joined')
			.setDescription(`${targetMember?.user.tag} assigned themself every single user assignable role, including <@&1097974123625451572>. Their roles have been stripped.`)
			.setFooter(message.embeds[0].footer)
			.setTimestamp(new Date(Date.parse(message.embeds[0].timestamp!)))
		modQueue.send({embeds: [susMemberEmbed]})
	}
})

client.login(process.env.BOT_TOKEN)

process.on('uncaughtException', error => {
	errorChannel?.send({files: [{attachment: Buffer.from(inspect(error, {depth: null}), 'utf-8'), name: 'error.ts'}]})
})