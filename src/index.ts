import { Client, Collection, Intents, Message, MessageActionRow, MessageAttachment, MessageButton, MessageEmbed, Modal, ModalActionRowComponent, TextChannel, TextInputComponent, User } from 'discord.js'
import { Routes } from 'discord-api-types/v9'
import { REST } from '@discordjs/rest'
import { GoogleSpreadsheet, GoogleSpreadsheetRow } from 'google-spreadsheet'
import { scheduleJob } from 'node-schedule'
import { schedule } from 'node-cron'
import { inspect } from 'util'
import parse from 'node-html-parser'
import fetch from 'node-fetch'
import fs from 'node:fs'
import os from 'os'
import Parser from 'rss-parser'
import axios from 'axios'
import { abbreviateAllNumbers, capFirstLetter, capitalize, dateToString, getAbbreviatedNumber, getDirectImgurLinks, getNumber, getTwitchAccessToken, getTwitchUserInfo, streamInfo, timeToUnix, userInfo } from './library'
import { registerFont } from 'canvas'

export const client: Client<boolean> & {commands?: Collection<unknown, unknown>} = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]})
export const isHost = os.hostname() !== 'PC-Hywell'
export const botSettings = {
	'developerMode': false, // Ignores all inputs from me (Cryo) if true
}
registerFont(require('@canvas-fonts/arial'), {family: 'Arial'})
registerFont(require('@canvas-fonts/arial-bold'), {family: 'Arial Bold'})

const privateCommandFiles = ['run.js', 'say.js']
const gameCommandNames = ['defense', 'drakenfrost', 'faq', 'image', 'link', 'listmods', 'listshards', 'minasc', 'mod', 'price', 'rate', 'shard', 'report', 'wiki']

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
	rest.put(Routes.applicationCommands(client.user?.id!), { body: commands })
		.then(() => console.log('Successfully registered application commands globally.'))
		.catch(console.error)

	rest.put(Routes.applicationGuildCommands(client.user?.id!, '379501550097399810'), { body: privateCommands })
		.then(() => console.log('Successfully registered private commands to The Cryo Chamber.'))
		.catch(console.error)
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
export let councilMemberTags: Array<string>

// Connecting to CG Bug Reporting Sheet
export let bugReportDoc: GoogleSpreadsheet
export let ddgrReports: Array<GoogleSpreadsheetRow>
export let ddaReports: Array<GoogleSpreadsheetRow>
export let dd2Reports: Array<GoogleSpreadsheetRow>

const serviceAccountCredentials = {client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!, private_key: process.env.GOOGLE_PRIVATE_KEY!}
export async function connectToDB () {
    publicDB = new GoogleSpreadsheet('1yOjZhkn9z8dJ8HMD0YSUl7Ijgd9o1KJ62Ecf4SgyTdU')
    privateDB = new GoogleSpreadsheet(process.env.PRIVATE_DB_ID)
	bugReportDoc = new GoogleSpreadsheet(process.env.CG_BUGREPORT_DOC_ID)

	await Promise.all([
		publicDB.useServiceAccountAuth(serviceAccountCredentials),
		privateDB.useServiceAccountAuth(serviceAccountCredentials),
		bugReportDoc.useServiceAccountAuth(serviceAccountCredentials)
	])
	await Promise.all([publicDB.loadInfo(), privateDB.loadInfo(), bugReportDoc.loadInfo()]);

	[
		auctions,
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
		privateDB.sheetsByTitle['Auctions'].getRows(),
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
	councilMemberTags = contributors.map(contributor => contributor.tag)
	blacklistedIDs = blacklist.map(user => user.id)

	console.log('Database connection successful')
}
connectToDB().then(() => registerCommands())

export let defenseBuildData: any = []
export async function loadDefenseBuilds(){
	defenseBuilds = new GoogleSpreadsheet('1sjBA60Fr9ryVnw4FUIMU2AVXbKw395Tdz7j--EAUA1A')
    await defenseBuilds.useServiceAccountAuth(serviceAccountCredentials)
    await defenseBuilds.loadInfo()
	defenseImages = await defenseBuilds.sheetsByTitle['Data'].getRows()

	let buildData: any = []
	for (let i = 2; i < defenseBuilds.sheetCount-1; i++){
		let sheet = defenseBuilds.sheetsByIndex[i]
		await sheet.loadCells()

		for (let y = 2; y < sheet.rowCount; y += 20){
			for (let x = 1; x < sheet.columnCount; x += 5){
				if (!sheet.getCell(y + 1, x + 2).value) continue
				buildData.push({
					name: sheet.getCell(y + 1, x + 2).value,
					role: sheet.getCell(y + 4, x + 2).value,
					shards: [sheet.getCell(y + 6, x + 2).value, sheet.getCell(y + 8, x + 2).value, sheet.getCell(y + 10, x + 2).value],
					mods: [
						{name: sheet.getCell(y + 12, x + 2).value, qualibean: sheet.getCell(y + 12, x + 1).formula?.match(/\d+/)?.toString()}, 
						{name: sheet.getCell(y + 14, x + 2).value, qualibean: sheet.getCell(y + 14, x + 1).formula?.match(/\d+/)?.toString()}, 
						{name: sheet.getCell(y + 16, x + 2).value, qualibean: sheet.getCell(y + 16, x + 1).formula?.match(/\d+/)?.toString()}
					],
					relic: sheet.getCell(y + 12, x).formula?.match(/(?<=").+(?=")/)?.toString()
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
client.on('ready', async () => {
	client.user?.setActivity('/help')
	
	logChannel = client.channels.cache.get('577636091834662915') as TextChannel
	errorChannel = client.channels.cache.get('936833258149281862') as TextChannel

	console.log('Protobot is now online')
	if (isHost) logChannel?.send('**:white_check_mark:  Protobot is now online**')

	setInterval(() => (client.channels.cache.get('762948660983496715') as TextChannel).edit({name: `Server Count: ${client.guilds.cache.size}`}), 1.8e+6) // Every half an hour
})

// Slash Command Handler
client.on('interactionCreate', async interaction => {
    if ((!interaction.isCommand() && !interaction.isMessageContextMenu()) || (!isHost && interaction.user.id !== '251458435554607114')) return
	if (blacklistedIDs?.includes(interaction.user.id)) return interaction.reply(`🤡 ${interaction.user} 🤡`)
	if (botSettings.developerMode && interaction.user.id === '251458435554607114' && interaction.commandName !== 'settings') return

	const isModCommand = modCommands.includes(`${interaction.commandName}.js`)
    const command: any = client.commands?.get(interaction.commandName)
	if (!command) return interaction.reply({content: 'Failed to load command. Please try again in a few seconds.', ephemeral: true})
	if (isModCommand && !(interaction.memberPermissions?.has('MANAGE_MESSAGES') || councilMemberTags?.includes((interaction.member?.user as User).tag))){
		return interaction.reply({content: 'You do not have permission to use this command.', ephemeral: true})
	} 

	try {
		await command.execute(interaction)
	} catch (error) {
		console.error(error)
		errorChannel.send({
			content: `🚫  **${interaction.user.tag}** ran the ${isModCommand ? 'mod ' : ''}command \`${interaction.commandName}\` in **${interaction.guild?.name ?? 'Direct Messages'}** (${interaction.guildId ?? interaction.channelId})`,
			files: [new MessageAttachment(Buffer.from(inspect(error, {depth: null}), 'utf-8'), 'error.ts')]
		})
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
	} finally {
		logChannel?.send(`:scroll:  **${interaction.user.tag}** ran the ${isModCommand ? 'mod ' : ''}command \`${interaction.commandName}\` in **${interaction.guild?.name ?? 'Direct Messages'}** (${interaction.guildId ?? interaction.channelId})`)
	}
})

// Message Command Handler, for testing only
const prefix = 'dd!'
client.on('messageCreate', (message: Message) => {
	if (message.author.id !== '251458435554607114' || message.author.bot || !message.content.startsWith(prefix)) return

	const args = message.content.slice(prefix.length).trim().split(' ')
	const command: string = args?.shift()?.toLowerCase()!
 
	try {
		const commands = require(`./messageCommands/${command}.js`)
		commands.run(client, message, prefix, args)
	} catch (error) {
		console.error(error)
		errorChannel.send({
			content: `🚫  **${message.author.tag}** ran the command \`${command}\` in **${message.guild?.name ?? 'Direct Messages'}** (${message.guildId ?? message.channelId})`,
			files: [new MessageAttachment(Buffer.from(inspect(error, {depth: null}), 'utf-8'), 'error.ts')]
		})
		message.channel.send('There was an error while executing this command!')
	} finally {
		logChannel?.send(`:scroll:  **${message.author.tag}** ran the command \`${command}\` in **${message.guild?.name ?? 'Direct Messages'}** (${message.guildId ?? message.channelId})`)
	}
})

// Looking-For-Trade Chat Automod (Dungeon Defenders Server only)
let AMLogChannel: TextChannel // The channel to send log messages to (Auto Mod Log Channel)
client.on('ready', async () => {AMLogChannel = client.channels.cache.get('916495567037816853') as TextChannel})

const tradeRules = '1. Follow the trading format below.\n2. One trade per line, no more than 1 image per message.\n3. Do not discuss trades here. See market-discussion.\n4. If a trade has been completed, delete or edit the original post.\n5. Do not post advertisements more than once every 23 hours.\n\n[**H**] = **Have**\n[**W**] = **Want**\nYou must include one of the above in your listing!\n\nExample Trades:\n[H]  99 Pristine Motes   [W] 3m <:gold:460345588911833088>\n[W] 99 Shiny Motes   [H] 3m <:gold:460345588911833088>\n\nTrade Format(copy & paste):\n```[H] item-name  [W] :gold:\n[W] item-name  [H] :gold:```'
client.on('messageCreate', async (message: Message) => {
	const LFTAutomodChannels = ['460339922231099402', '460340670960500737', '460340942990475264'] // The channels that should be automodded
	if (message.channel.type === 'DM' || !LFTAutomodChannels.includes(message.channelId) || !AMLogChannel || message.author.bot || !userLogs) {return}

	function createDelMsgEmbed(reason: string){
		if (!message.content){message.content = 'No Content'}
		return new MessageEmbed()
			.setColor('RED')
			.setAuthor({name: `${message.author.tag}  |  ${user.warnings} Warnings`, iconURL: message.author.displayAvatarURL({format: 'png'})})
			.setDescription(`Message sent by ${message.author} deleted in ${message.channel}`)
			.addField('Content', message.content.length > 1024 ? `${message.content.slice(0, 1020)}...` : message.content)
			.addField('Reason', `Trade Channel Rule Violation: ${reason}`)
			.setFooter({text: `Author: ${message.author.id} | Message ID: ${message.id}`})
			.setTimestamp(new Date())
	}

	function DMRules(violation: string){
		const dmEmbeds = [
			new MessageEmbed().setColor('ORANGE').setTitle('Looking-For-Trade Channel Rules:').setDescription(tradeRules),
			new MessageEmbed().setColor('ORANGE').setTitle("Here's what you posted:").setDescription(`\`\`\`${message.content}\`\`\``)
		]
		if (violation.includes('23')){dmEmbeds.push(new MessageEmbed().setColor('ORANGE').setDescription(`You may post again after <t:${Date.parse(user.time)/1000 + 8.28e+4}>`))}
		message.author.send({content: `${violation} Please review the Looking-For-Trade channel rules here:`, embeds: dmEmbeds})
	}
	
	const user: any = userLogs.find(user => user.authorID === message.author.id) || {lastMsgID: '', authorID: '', time: new Date(message.createdTimestamp).toString(), warnings: 0}
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
	if (!userLogs.find(user => user.authorID === message.author.id)){
		user.authorTag = message.author.tag
		await privateDB.sheetsByTitle['User Logs'].addRow(user)
		userLogs = await privateDB.sheetsByTitle['User Logs'].getRows()
	} else {await user.save()}
})

// Youtube Post Notifications
schedule('* * * * *', () => {
	if (!isHost || !youtubeChannels) return
	youtubeChannels.forEach(async channel => {
		const discordChannel = client.channels.cache.get(channel.discordChannelID) as TextChannel
		const feed = await new Parser().parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${channel.youtubeID}`).catch(() => undefined) // Parse the RSS Feed for the channel, ignore any 404 errors if the rss feed is unavailable
		if (!feed) return
		const newVideo = feed.items[0] // The most recently published video
		const recentVideos: string[] = channel.recentVideos ? JSON.parse(channel.recentVideos) : []
		if (!recentVideos.includes(newVideo.link!)){
			const {data} = await axios.get(newVideo.link!)
			if (/Scheduled\sfor/i.test(data)) return // Do not post if this is a scheduled stream (the user has not gone live)
			else {
				if (/watching\snow/i.test(data)){
					discordChannel.send(`${newVideo.author} is now live!\n${newVideo.link}`)
				} else {
					discordChannel.send(`${newVideo.author} has uploaded a new video!\n${newVideo.link}`)
				}
				if (recentVideos.length >= 5) recentVideos.shift() // Only store the 5 most recent videos
				recentVideos.push(newVideo.link!)
				channel.recentVideos = JSON.stringify(recentVideos) // Store the video so that it doesn't get posted again
				channel.save()
			}
		}
	})
})

// Twitch Live Notifications
schedule('* * * * *', () => {
	if (!isHost || !twitchChannels) return
	twitchChannels.forEach(async channel => {
		const discordChannel = client.channels.cache.get(channel.discordChannelID) as TextChannel
		const [streamInfo, userInfo] = await Promise.all([
			getTwitchUserInfo(channel.username, 1) as unknown as streamInfo,
			getTwitchUserInfo(channel.username, 1) as unknown as userInfo
		])
		if (!streamInfo || !userInfo) return

		const twitchStreamEmbed = new MessageEmbed()
			.setAuthor({name: 'Twitch', iconURL: 'https://cdn.icon-icons.com/icons2/3041/PNG/512/twitch_logo_icon_189242.png'})
			.setTitle(`${streamInfo.user_name} is playing ${streamInfo.game_name}!`)
			.setURL(`https://www.twitch.tv/${channel.username}`)
			.setDescription(streamInfo.title)
			.setThumbnail(userInfo.profile_image_url)
			.setColor('PURPLE')

		discordChannel.send({embeds: [twitchStreamEmbed]})
	})
})

// DD2 Wiki Changes
schedule('* * * * *', async () => {
	if (!isHost) return
	const wikiChannel = client.channels.cache.get('1024790555999346758') as TextChannel
	const res = await axios.get('https://wiki.dungeondefenders2.com/api.php?action=query&list=recentchanges&rcprop=user|title|timestamp|comment|loginfo|ids&rclimit=5&format=json')
    const {data: {query: {recentchanges}}} = res
	const recentChangeIDsInfo = variables.find(v => v.name === 'recentChangeIDs')!
	const recentChangeIDs = JSON.parse(recentChangeIDsInfo.value || '[]')
	const changes = recentchanges.filter((change: any) => change.logaction !== 'create').reverse()

	for await (const change of changes){
		if (recentChangeIDs.includes(change.rcid)) continue
		recentChangeIDs.push(change.rcid)
		const action = change.type === 'log'
			? change.logaction === 'overwrite' 
				? 'overwrote' 
				: change.logaction.replace(/e$/, '') + 'ed'
			: change.type === 'new'
				? 'created'
				: 'edited'
		const url = `https://wiki.dungeondefenders2.com/index.php?title=${change.title}&diff=${change.revid}`.replace(/\s/g, '_')
		const wikiChangeEmbed = new MessageEmbed()
			.setAuthor({name: change.user, url: `https://wiki.dungeondefenders2.com/wiki/User:${change.user.replace(/\s/g, '_')}`})
			.setTitle(`${change.user} ${capFirstLetter(action)} "${change.title}"`)
			.setURL(url)
			.addField('Comment', change.comment || 'No Comment Provided')
			.setColor('ORANGE')
			.setTimestamp(Date.parse(change.timestamp))

		if (action === 'edited'){
			const {data} = await axios.get(url)
			const document = parse(data)
			const removed = document.querySelectorAll('.diff-deletedline').map(e => `- ${e.textContent}`).join('\n')
			const added = document.querySelectorAll('.diff-addedline').map(e => `+ ${e.textContent}`).join('\n')
			if (removed) wikiChangeEmbed.addField('Removed', '```diff\n' + (removed.length > 950 ? `${removed.substring(0, 950)}\n- and more...` : removed) + '```')
			if (added) wikiChangeEmbed.addField('Added', '```diff\n' + (added.length > 950 ? `${added.substring(0, 950)}\n+ and more...` : added) + '```')
		} else if (change.logparams?.img_sha1){
			const {data} = await axios.get(url)
			const document = parse(data)
			const imgURL = document.querySelector('img')!.getAttribute('src')!
			wikiChangeEmbed.setImage(`https://wiki.dungeondefenders2.com${imgURL}`)
		}

		wikiChannel.send({embeds: [wikiChangeEmbed]})
	}
	if (recentChangeIDsInfo.value === JSON.stringify(recentChangeIDs.slice(-10))) return
	recentChangeIDsInfo.value = JSON.stringify(recentChangeIDs.slice(-10)) // Store the recent change IDs to prevent duplicates
	await recentChangeIDsInfo.save()
})

// Handle modals
interface auctionBid {bidder: string, bid: string, status: string, timestamp: string}
client.on('interactionCreate', async interaction => {
	if (!interaction.isModalSubmit() || (interaction.user.id === '251458435554607114' && botSettings.developerMode)) return
	
	// Dungeon Defenders Bug Reports and Feedback
	if (/(Feedback|Bug Report) Form/.test(interaction.customId)){
		const isFeedback = /Feedback/.test(interaction.customId)
		const anonymous = /Anonymous/.test(interaction.customId)
		interaction.reply({content: `${isFeedback ? 'Feedback' : 'Bug Report'} received!`}).then(() => setTimeout(() => interaction.deleteReply(), 5000))
		const ddGame = (interaction.customId.match(/dd(?:gr|a|2)/i)!.toString()!).toUpperCase()
		const title = interaction.fields.getTextInputValue('Report Title')
		const description = interaction.fields.getTextInputValue('Report Description')
		const reproSteps = !isFeedback ? interaction.fields.getTextInputValue('Bug Reproduction Steps') : undefined
		const gameMode = !isFeedback ? interaction.fields.getTextInputValue('Game Mode') : undefined
		const links = interaction.fields.getTextInputValue('Links')
		const reportLinks = (links && /https?:\/\/.+?(?=$|http)/.test(links)) ? links.match(/https?:\/\/.+?(?=$|http)/gm)! : []
		const imgurLinks = reportLinks.filter(link => link.includes('imgur.com'))
		if (imgurLinks) imgurLinks.forEach(async link => {
			reportLinks.splice(reportLinks.indexOf(link), 1)
			reportLinks.push(...await getDirectImgurLinks(link))
		})
		
		async function isImage(url: string){  
			const res = await fetch(url)
			return /image/i.test(res.headers.get('content-type')!)
		}

		(interaction.channel as TextChannel).threads.create({name: capitalize(title), reason: 'Bug Report/Feedback Thread'}).then(async thread => {
			const parentMessageLink = `https://discord.com/channels/${interaction.guildId}/${interaction.channelId!}/${thread.id}`
			const reportEmbed = new MessageEmbed()
				.setTitle(`${isFeedback ? 'Feedback' : 'Bug'} Description:`)
				.setDescription(description)
				.setURL(parentMessageLink)
				.setColor('ORANGE')

			if (anonymous) reportEmbed.setAuthor({name: isFeedback ? 'Feedback' : 'Bug Report'})
			else reportEmbed.setAuthor({name: `${isFeedback ? 'Feedback' : 'Bug Report'} by ${(interaction.member?.user as User).tag}`, iconURL: interaction.user.displayAvatarURL({format: 'png'})})
			if (reproSteps) reportEmbed.addField('Steps to Reproduce the Bug:', reproSteps)
			if (gameMode) reportEmbed.addField('Game Mode/Map/Difficulty:', gameMode)

			const embedArray = [reportEmbed]
			const otherLinks = []
			if (reportLinks){
				for (let i = 0; i < reportLinks.length; i++){
					if (!reportLinks[i]) continue
					if (embedArray.length > 9 || !await isImage(reportLinks[i])) {otherLinks.push(reportLinks[i]); continue}
					if (!reportEmbed.image) {reportEmbed.setImage(reportLinks[i]); continue}
					const reportImageEmbed = new MessageEmbed()
						.setURL(i > 3 ? parentMessageLink+'/' : parentMessageLink) // Adding the slash is necessary to split up the embeds so that they technically use different links
						.setImage(reportLinks[i])
						.setColor('ORANGE')
					if (i === 4) reportImageEmbed.setTitle('Additional Images:')
					embedArray.push(reportImageEmbed)
				}
			}
			if (otherLinks.length > 0) reportEmbed.addField('Relevant Links:', otherLinks.join('\n'))
			
			reportEmbed.addField('\u200b', `[Click Here to vote on this ${isFeedback ? 'feedback' : 'bug report'}](${parentMessageLink})`)
			thread.send({embeds: embedArray})
			const threadMessage = (client.channels.cache.get(interaction.channelId!) as TextChannel).messages.cache.get(thread.id)
			threadMessage?.react('<:thumbs_up:745501111015833632>')
			threadMessage?.react('<:thumbs_sideways:745501110403465318>')
			threadMessage?.react('<:thumbs_down:745501108075626578>')
			
			if (isFeedback) return
			await bugReportDoc.sheetsByTitle[`${ddGame} Discord Reports`].addRow([
				dateToString(new Date(interaction.createdTimestamp), 'EST', true),
				interaction.user.tag,
				interaction.user.id,
				title,
				description,
				reproSteps || '',
				gameMode || '',
				reportLinks ? reportLinks.join('\n') : ''
			])
		})
	}

	// Handle Auction Creation
	if (interaction.customId === 'Auction Modal'){
		const title = interaction.fields.getTextInputValue('Title')
		const description = interaction.fields.getTextInputValue('Description')
		let minBid = interaction.fields.getTextInputValue('Minimum Bid')
		if (!(minBid.includes('gold') || /^[\d\s.]+(?:[tbmk]{1})?$/i.test(minBid))) return interaction.reply({content: 'Setting the minimum bid to a non-gold value is currently not supported.', ephemeral: true})
		if (/^[\d\s.]+(?:[tbmk]{1})?$/i.test(minBid)) minBid += ' gold'
		minBid = abbreviateAllNumbers(minBid)
		const duration = interaction.fields.getTextInputValue('Duration')
		if (timeToUnix(duration) < 3600000 || timeToUnix(duration) > 604800000) return interaction.reply({content: 'Auction duration cannot be lower than 1 hour or greater than 7 days.', ephemeral: true})
		const endDate = new Date(new Date().getTime() + timeToUnix(duration))
		const links = interaction.fields.getTextInputValue('Links')
		const parsedLinks = (links && /https?:\/\/.+?(?=$|http)/.test(links)) ? links.match(/https?:\/\/.+?(?=$|http)/gm)! : []
		const imgurLinks = parsedLinks.filter(link => link.includes('imgur.com'))
		if (imgurLinks) imgurLinks.forEach(async link => {
			parsedLinks.splice(parsedLinks.indexOf(link), 1)
			parsedLinks.push(...await getDirectImgurLinks(link))
		})

		const channelLink = `https://discord.com/channels/${interaction.guildId}/${interaction.channelId!}`
		const auctionEmbed = new MessageEmbed()
			.setAuthor({name: `Auction by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({format: 'png'})})
			.setTitle(`${title}`)
			.setDescription(description)
			.addField('Minimum Bid:', minBid.replace(/gold/ig, '<:gold:460345588911833088>'), true)
			.addField('Top Bidder:', 'None', true)
			.addField('Time Remaining:', `Ends <t:${Math.ceil(endDate.getTime()/1000)}:R>`, true)
			.setColor('ORANGE')
			.setURL(channelLink)
			.setFooter({text: 'Ends'})
			.setTimestamp(endDate)
		
		const embedArray = [auctionEmbed]
		if (parsedLinks){
			for (let i = 0; i < parsedLinks.length; i++){
				if (i > 3) break // Limit to 4 images
				if (!parsedLinks[i]) continue
				if (!auctionEmbed.image) {auctionEmbed.setImage(parsedLinks[i]); continue}
				const auctionImageEmbed = new MessageEmbed()
					.setURL(channelLink)
					.setImage(parsedLinks[i])
					.setColor('ORANGE')
				embedArray.push(auctionImageEmbed)
			}
		}

		const auctionInputs = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('Auction Bid Button')
					.setLabel(`Place Bid`)
					.setStyle('PRIMARY')
			)
			.addComponents(
				new MessageButton()
					.setCustomId('Retract Bid Button')
					.setLabel(`Retract Bid`)
					.setStyle('DANGER')
			)
			.addComponents(
				new MessageButton()
					.setCustomId('Cancel Auction Button')
					.setLabel(`Cancel Auction`)
					.setStyle('DANGER')
			)
		
		let DMSuccess = true
		const userMessage = await interaction.user.send({content: "You've started an auction! Here's an overview:"}).catch(() => {
			DMSuccess = false
			interaction.reply({content: 'You must enable direct messages to start an auction!', ephemeral: true})
		})
		if (!DMSuccess) return

		const auctionMessage = await interaction.reply({embeds: embedArray, components: [auctionInputs], fetchReply: true}) as Message
		const auctionOverviewEmbed = new MessageEmbed()
			.setAuthor({name: `Auction by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({format: 'png'})})
			.setTitle(`${title}`)
			.setDescription(description)
			.addField('Minimum Bid:', minBid.replace(/gold/ig, '<:gold:460345588911833088>'), true)
			.addField('Time Remaining:', `Ends <t:${Math.ceil(endDate.getTime()/1000)}:R>`, true)
			.addField('Direct Link:', `[Click Here](${channelLink}/${auctionMessage.id})`, true)
			.setColor('ORANGE')
			.setURL(`${channelLink}/${auctionMessage.id}`)
			.setFooter({text: 'Ends'})
			.setTimestamp(endDate)
		await (userMessage as Message).edit({embeds: [auctionOverviewEmbed]})

		const auction = await privateDB.sheetsByTitle['Auctions'].addRow({
			auctioneerID: interaction.user.id,
			auctionID: auctionMessage.id,
			title: title,
			startDate: new Date().toString(),
			endDate: endDate.toString(),
			bids: JSON.stringify([{bidder: null, bid: minBid, status: 'Accepted', timestamp: new Date().toString()}]),
			status: 'Running'
		})
		auctions.push(auction)

		scheduleJob(endDate, async function(msgID: string, channelID: string){
			const message = await client.channels.fetch(channelID).then(channel => (channel as TextChannel).messages.fetch(msgID))
			const auctionEntry = auctions.find(entry => entry.auctionID === message.id)!
			const auctionBids: auctionBid[] = JSON.parse(auctionEntry.bids).filter((bid: auctionBid) => bid.status === 'Accepted')
			const topBid = auctionBids.reverse()[0]
			auctionEntry.status = 'Concluded'
			await auctionEntry.save()

			const auctionEmbed = message.embeds[0]
			auctionEmbed.fields[2].value = 'Ended'
			auctionEmbed.setFooter({text: 'Ended'})
			auctionEmbed.setColor('RED')
			auctionEmbed.setTimestamp(null)
			await message.edit({embeds: [auctionEmbed], components: []})

			client.users.fetch(auctionEntry.auctioneerID).then(async user => {
				const auctionWinner = await client.users.fetch(topBid.bidder)
				const auctionEndEmbed = new MessageEmbed()
					.setTitle('Auction Concluded')
					.setDescription(`Your auction for [${auctionEntry.title}](${auctionEmbed.url}/${message.id}) has ended! Contact the winner to set up the transaction!`)
					.addField('Winner:', `<@${topBid.bidder}> (${auctionWinner.tag})`)
					.addField('Winning bid:', topBid.bid)
					.setURL(`${auctionEmbed.url}/${message.id}`)
					.setColor('ORANGE')

				const auctionFailEmbed = new MessageEmbed()
					.setTitle('Auction Concluded')
					.setDescription(`Your auction for [${auctionEntry.title}](${auctionEmbed.url}/${message.id}) has ended, but no bids were placed.`)
					.setURL(`${auctionEmbed.url}/${message.id}`)
					.setColor('ORANGE')
				user.send({embeds: [topBid.bidder ? auctionEndEmbed : auctionFailEmbed]})
			})

			if (!topBid?.bidder) return
			const auctioneer = await client.users.fetch(auctionEntry.auctioneerID)
			const auctionWinEmbed = new MessageEmbed()
				.setDescription(`You won an auction by ${auctioneer} (${auctioneer.tag}) for [${auctionEntry.title}](${auctionEmbed.url}/${message.id})! Contact them to set up the transaction!`)
				.setColor('ORANGE')
			client.users.fetch(topBid.bidder).then(user => user.send({embeds: [auctionWinEmbed]}))
		}.bind(null, auctionMessage.id, auctionMessage.channelId))
	}

	// Auction Bids
	if (interaction.customId === 'Auction Bid Modal'){
		const auction = (interaction.message as Message)
		const auctionEntry = auctions.find(entry => entry.auctionID === auction.id)!
		const auctionBids: auctionBid[] = JSON.parse(auctionEntry.bids)
		const filteredBids = auctionBids.filter((bid: auctionBid) => bid.status === 'Accepted' || bid.status === 'Pending')
		const currentBid = filteredBids[filteredBids.length - 1] ?? auctionBids[0]
		let incomingBid = interaction.fields.getTextInputValue('Auction Bid')
		if (/^[\d\s.]+(?:[tbmk]{1})?$/i.test(incomingBid)) incomingBid += ' gold'
		let bidStatus: string

		// Determines whether or not the bid is an amount of gold and nothing else
		const onlyGold = (bid: string | number) => /^[\d\s.]+(?:[tbmk]{1})?\s?gold$/i.test(String(bid).trim())

		if (onlyGold(currentBid.bid) && onlyGold(incomingBid)){
			const minBid = getNumber(currentBid.bid) * 1.1
			const maxBid = getNumber(currentBid.bid) * 10
			if (getNumber(incomingBid) > maxBid) return interaction.reply({content: `You cannot bid more than 10x the current top bid!`, ephemeral: true})
			if (getNumber(incomingBid) < minBid && currentBid.bidder){
				return interaction.reply({content: `To outbid the current top bidder, you must bid at least ${minBid} (${getAbbreviatedNumber(minBid)}) gold!`, ephemeral: true})
			}
			if (getNumber(incomingBid) < getNumber(currentBid.bid)) {
				return interaction.reply({content: `You must bid at least ${getNumber(currentBid.bid)} (${getAbbreviatedNumber(getNumber(currentBid.bid))}) gold!`, ephemeral: true})
			}
			auction.embeds[0].fields[0].name = 'Top Bid:'
			auction.embeds[0].fields[0].value = abbreviateAllNumbers(incomingBid).replace(/gold/i, '<:gold:460345588911833088>')
			auction.embeds[0].fields[1].value = String(interaction.user)
			await auction.edit({embeds: [auction.embeds[0]]})
			bidStatus = 'Accepted'
			if (currentBid.bidder && interaction.user.id !== currentBid.bidder){
				const outbidEmbed = new MessageEmbed()
					.setDescription(`You have been outbid in the auction for [${auctionEntry.title}](${auction.embeds[0].url}/${auction.id})!`)
					.setColor('ORANGE')
				client.users.fetch(currentBid.bidder).then(user => user.send({embeds: [outbidEmbed]}))
			}
			interaction.reply({content: 'Bid successful!', ephemeral: true})
		} else {
			// Do something else here
			bidStatus = 'Pending'
			return interaction.reply({content: 'Bidding with items other than gold is not currently supported.', ephemeral: true})
		}

		const userBid = filteredBids.find((bid: auctionBid) => bid.bidder === interaction.user.id)
		if (userBid) auctionBids.splice(auctionBids.indexOf(userBid), 1, {...userBid, status: 'Replaced'})
		auctionBids.push({
			bidder: interaction.user.id,
			bid: incomingBid,
			status: bidStatus,
			timestamp: new Date().toString()
		})
		const auctionIndex = auctions.indexOf(auctionEntry)
		auctionEntry.bids = JSON.stringify(auctionBids)
		auctions.splice(auctionIndex, 1, auctionEntry)
		auctionEntry.save()
	}
})

// Handle Buttons
client.on('interactionCreate', async interaction => {
	if (!interaction.isButton() || (interaction.user.id === '251458435554607114' && botSettings.developerMode)) return

	if (interaction.customId === 'Auction Bid Button'){
		const auctionEntry = auctions.find(entry => entry.auctionID === interaction.message.id)!
		const filteredBids: auctionBid[] = JSON.parse(auctionEntry.bids).filter((bid: auctionBid) => bid.status === 'Accepted' || bid.status === 'Pending')
		if (interaction.user.id === auctionEntry.auctioneerID) return interaction.reply({content: 'You cannot bid on your own auction!', ephemeral: true})
		if (interaction.user.id === filteredBids.reverse()[0].bidder) return interaction.reply({content: 'You are already the top bidder!', ephemeral: true})
		if (new Date() > new Date(auctionEntry.endDate)) return interaction.reply({content: 'This auction has already ended!', ephemeral: true})

		const bidModal = new Modal()
			.setCustomId(`Auction Bid Modal`)
			.setTitle('Place a Bid')
		
		const bid = new MessageActionRow<ModalActionRowComponent>().addComponents(
			new TextInputComponent()
				.setCustomId('Auction Bid')
				.setLabel('Your Bid')
				.setStyle('SHORT')
				.setMaxLength(100)
				.setRequired(true)
		)

		bidModal.addComponents(bid)
		await interaction.showModal(bidModal)
	}

	if (interaction.customId === 'Retract Bid Button'){
		const auction = (interaction.message as Message)
		const auctionEntry = auctions.find(entry => entry.auctionID === auction.id)!
		const auctionBids: auctionBid[] = JSON.parse(auctionEntry.bids)
		const filteredBids = auctionBids.filter(bid => bid.status === 'Accepted' || bid.status === 'Pending')
		if (filteredBids.filter(bid => bid.bidder === interaction.user.id && bid.status === 'Retracted').length > 2){ // Limit of 2 retractions per user per auction
			return interaction.reply({content: 'You can no longer retract any more bids in this auction.', ephemeral: true})
		}
		const userBid = filteredBids.find((bid: auctionBid) => bid.bidder === interaction.user.id)
		const endDate = new Date(auctionEntry.endDate)
		if (new Date() > endDate) return interaction.reply({content: 'This auction has already ended!', ephemeral: true})
		if (!userBid) return interaction.reply({content: 'You currently have no bids to retract!', ephemeral: true})
		if ((endDate.getTime() - new Date().getTime() < 3.6e+6) || (new Date().getTime() - new Date(userBid.timestamp).getTime() > 1.8e+6)){ // If there is less than 1 hour left in the auction or the bid was placed more than 30 minutes ago
			return interaction.reply({content: 'Your bid can no longer be retracted at this time.', ephemeral: true})
		}
		
		auctionBids.splice(auctionBids.indexOf(userBid), 1, {...userBid, status: 'Retracted', timestamp: new Date().toString()})
		const auctionIndex = auctions.indexOf(auctionEntry)
		auctionEntry.bids = JSON.stringify(auctionBids)
		auctions.splice(auctionIndex, 1, auctionEntry)
		await auctionEntry.save()

		const prevHighestBid = auctionBids.reverse().find(bid => bid.status !== 'Retracted') ?? auctionBids[auctionBids.length - 1]
		auction.embeds[0].fields[0].value = abbreviateAllNumbers(prevHighestBid.bid).replace(/gold/i, '<:gold:460345588911833088>')
		auction.embeds[0].fields[1].value = prevHighestBid.bidder ? `<@${prevHighestBid.bidder}>` : 'None'
		await auction.edit({embeds: [auction.embeds[0]]})
		interaction.reply({content: 'Bid retracted.', ephemeral: true})
	}

	if (interaction.customId === 'Cancel Auction Button'){
		const auction = interaction.message
		const auctionEntry = auctions.find(entry => entry.auctionID === interaction.message.id)!
		const filteredBids: auctionBid[] = JSON.parse(auctionEntry.bids).filter((bid: auctionBid) => bid.status === 'Accepted' || bid.status === 'Pending')
		const topBid = filteredBids[filteredBids.length - 1]
		if (new Date() > auctionEntry.endDate) return interaction.reply({content: 'This auction has already ended!', ephemeral: true})
		if (!(interaction.user.id === auctionEntry.auctioneerID || interaction.memberPermissions?.has('MANAGE_MESSAGES'))){
			return interaction.reply({content: 'You do not have permission to cancel this auction.', ephemeral: true})
		}
		if ((new Date((interaction.message as Message).createdTimestamp).getTime() - new Date().getTime() > 3600000) && !interaction.memberPermissions?.has('MANAGE_MESSAGES')){
			return interaction.reply({content: 'You cannot cancel an auction after it has been running for over an hour.', ephemeral: true})
		}
		(interaction.message as Message).delete()
		
		const auctionIndex = auctions.indexOf(auctionEntry)
		auctionEntry.status = 'Cancelled'
		auctions.splice(auctionIndex, 1, auctionEntry)
		await auctionEntry.save()
		const cancelledEmbed = new MessageEmbed()
			.setDescription(`The auction for [${auctionEntry.title}](${auction.embeds[0].url}/${auction.id}) has been cancelled.`)
			.setColor('ORANGE')
		if (topBid?.bidder) client.users.fetch(topBid.bidder).then(user => user.send({embeds: [cancelledEmbed]}))
		interaction.reply({content: 'Auction cancelled.', ephemeral: true})
	}
})

client.login(process.env.BOT_TOKEN)

process.on('uncaughtException', function (error) {
	errorChannel?.send({files: [new MessageAttachment(Buffer.from(inspect(error, {depth: null}), 'utf-8'), 'error.ts')]})
})