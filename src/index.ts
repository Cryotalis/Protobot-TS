import { ActionRowBuilder, ChannelType, Client, Collection, EmbedBuilder, ForumChannel, GatewayIntentBits, Message, ModalBuilder, REST, Routes, TextChannel, TextInputBuilder, TextInputStyle } from 'discord.js'
import { inspect } from 'util'
import { readdirSync } from 'node:fs'
import { registerFont } from 'canvas'
import { connectDatabase, database } from './database/index.js'
import { loadDefenseBuilds } from './database/defenseBuilds.js'

import './cron/index.js'

const devMode = true
export const client: Client<boolean> & {commands?: Collection<unknown, unknown>} = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent], rest: {timeout: 60000}})
export const botID = devMode ? '631961435051917362' : '521180443958181889'
const botToken = devMode ? process.env.DEV_TOKEN! : process.env.BOT_TOKEN!

registerFont('assets/Arial.ttf', {family: 'Arial'})
registerFont('assets/Arial Bold.ttf', {family: 'Arial Bold'})

export const privateCommandFiles = ['run.js', 'say.js']
export const regCommands = readdirSync('./prod/commands').filter(file => file.endsWith('.js'))
export const modCommands = readdirSync('./prod/modCommands').filter(file => file.endsWith('.js'))
export const commandFiles = regCommands.concat(modCommands)

export async function registerCommands() {
	const commands = []
	const privateCommands = [] // Administrator level commands only usable by privileged users
	client.commands = new Collection()

	for (const file of commandFiles) {
		const { command } = regCommands.includes(file) 
			? await import(`./commands/${file}`) 
			: await import(`./modCommands/${file}`)

		privateCommandFiles.includes(file)
			? privateCommands.push(command.data.toJSON())
			: commands.push(command.data.toJSON())

		client.commands.set(command.data.name, command)
	}

	const rest = new REST({ version: '9' }).setToken(botToken)
	rest.put(Routes.applicationCommands(botID), { body: commands })
		.then(() => console.log('Successfully registered application commands globally'))
		.catch(console.error)

	rest.put(Routes.applicationGuildCommands(botID, '379501550097399810'), { body: privateCommands })
}

connectDatabase().then(() => registerCommands())
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
    if ((!interaction.isCommand() && !interaction.isMessageContextMenuCommand())) return
	if (database.blacklist.find(user => user.get('id') === interaction.user.id)) {interaction.reply(`${interaction.user} you have been banned running commands.`); return}

	const isModCommand = modCommands.includes(`${interaction.commandName}.js`)
    const command: any = client.commands?.get(interaction.commandName)
	if (!command) {interaction.reply({content: 'Failed to load command. Please try again in a few seconds.', ephemeral: true}); return}
	if (isModCommand && !(interaction.memberPermissions?.has('ManageMessages') || database.contributors.find(user => user.get('id') === interaction.user.id))){
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

// Looking-For-Trade Chat Automod (Dungeon Defenders Server only)
let AMLogChannel: TextChannel // The channel to send log messages to (Auto Mod Log Channel)
client.on('ready', async () => {AMLogChannel = client.channels.cache.get('916495567037816853') as TextChannel})
	
const tradeRules = '1. Follow the trading format below.\n2. One trade per line, no more than 1 image per message.\n3. Do not discuss trades here. See market-discussion.\n4. If a trade has been completed, delete or edit the original post.\n5. Do not post advertisements more than once every 23 hours.\n\n[**H**] = **Have**\n[**W**] = **Want**\nYou must include one of the above in your listing!\n\nExample Trades:\n[H]  99 Pristine Motes   [W] 3m <:gold:460345588911833088>\n[W] 99 Shiny Motes   [H] 3m <:gold:460345588911833088>\n\nTrade Format(copy & paste):\n```[H] item-name  [W] :gold:\n[W] item-name  [H] :gold:```'
client.on('messageCreate', async (message: Message) => {
	const LFTAutomodChannels = ['460339922231099402', '460340670960500737', '460340942990475264'] // The channels that should be automodded
	if (message.channel.type === ChannelType.DM || !LFTAutomodChannels.includes(message.channelId) || !AMLogChannel || message.author.bot || !database.userLogs) return

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
	
	const user: any = database.userLogs.find(user => user.get('authorID') === message.author.id) || {lastMsgID: '', authorID: '', time: new Date(message.createdTimestamp).toString(), warnings: 0}
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
	if (!database.userLogs.find(user => user.get('authorID') === message.author.id)){
		user.authorTag = message.author.tag
		await database.userLogsTable.addRow(user)
		// TODO: Is this actually necessary?
		// If so, the row could just be added to the table via push to database.userLogs
		database.userLogs = await database.userLogsTable.getRows()
	} else {await user.save()}
})

// Handle Buttons
client.on('interactionCreate', async interaction => {
	if (!interaction.isButton()) return

	if (interaction.customId === 'Helper Application Button'){
		const helperAppPart1 = new ModalBuilder()
			.setCustomId('Helper Application Modal')
			.setTitle('Helper Application')
			.addComponents(
				new ActionRowBuilder<TextInputBuilder>()
				.addComponents(
					new TextInputBuilder()
						.setCustomId('Helper Reason')
						.setLabel('Why are you interested in becoming a Helper?')
						.setStyle(TextInputStyle.Paragraph)
						.setMaxLength(1000)
						.setRequired(true)
				)
				.addComponents(
					new TextInputBuilder()
						.setCustomId('DD Game')
						.setLabel('Which DD Game are you most experienced with?')
						.setPlaceholder('DD1 / DD2 / DDA / etc.')
						.setStyle(TextInputStyle.Short)
						.setRequired(true)
				)
				.addComponents(
					new TextInputBuilder()
						.setCustomId('DD Game Hours')
						.setLabel('Around how many hours have you logged?')
						.setPlaceholder('The approximate number of hours you\'ve spent in the DD game you\'re most experienced with.')
						.setStyle(TextInputStyle.Short)
						.setRequired(true)
				)
				.addComponents(
					new TextInputBuilder()
						.setCustomId('DD Game Solo')
						.setLabel('What is the hardest content you can do solo?')
						.setPlaceholder('The hardest content you can consistently solo in the DD game you\'re most experienced with.')
						.setStyle(TextInputStyle.Short)
						.setRequired(true)
				)
				.addComponents(
					new TextInputBuilder()
						.setCustomId('DD Game Knowledge')
						.setLabel('Rate your knowledge of your chosen DD game.')
						.setPlaceholder('Rate your knowledge on a scale from 0 to 10. 0 means you know nothing, 10 means you know everything.')
						.setStyle(TextInputStyle.Short)
						.setRequired(true)
				)
			)

		await interaction.showModal(helperAppPart1)
	}

	if (interaction.customId === 'Content Creator Button'){
		const contentCreatorModal = new ModalBuilder()
			.setCustomId('Content Creator Modal')
			.setTitle('Content Creator Role Request')
			.addComponents(
				new ActionRowBuilder<TextInputBuilder>()
				.addComponents(
					new TextInputBuilder()
						.setCustomId('Channel Link')
						.setLabel('Please provide a link to your channel')
						.setPlaceholder('YouTube/Twitch Channel Link')
						.setStyle(TextInputStyle.Paragraph)
						.setRequired(true)
				)
			)

		await interaction.showModal(contentCreatorModal)
	}

	if (interaction.customId === 'Defender Role Button'){
		
	}
})

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

const forumIDs = [
	'1183125378613657720', // bug-report-test
	'1166774506002591765', // server-suggestions
	'1167947531469201469', // role-requests
]
client.on('threadCreate', async thread => {
	if (!forumIDs.includes(thread.parent?.id ?? '')) return
	const messages = await thread.awaitMessages({max: 1, time: 5000})
	const starterMessage = messages.first()
	if (!starterMessage) return
	await starterMessage.react('<:thumbs_up:745501111015833632>')
	await starterMessage.react('<:thumbs_sideways:745501110403465318>')
	await starterMessage.react('<:thumbs_down:745501108075626578>')
})

client.on('threadUpdate', (oldThread, newThread) => {
	const oldTags = oldThread.appliedTags
	const newTags = newThread.appliedTags
	if (!forumIDs.includes(oldThread.parent?.id ?? '') || oldTags.join() === newTags.join()) return

	const tags = (oldThread.parent as ForumChannel).availableTags
	const tag = tags.find(tag => tag.id === (newTags.length > oldTags.length ? newTags.find(tag => !oldTags.includes(tag)) : oldTags.find(tag => !newTags.includes(tag))))!
	const tagEmoji = tag.emoji 
		? tag.emoji.id 
			? `<:${tag.emoji.name}:${tag.emoji.id}> `
			: tag.emoji.name + ' '
		: ''

	if (newTags.length > oldTags.length) {
		newThread.send({content: `<@${oldThread.ownerId}>, your post has been tagged as **${tagEmoji + tag.name}**.`, flags: ['SuppressNotifications']})
	} else {
		newThread.send({content: `<@${oldThread.ownerId}>, the **${tagEmoji + tag.name}** tag has been removed from your post.`, flags: ['SuppressNotifications']})
	}
})

client.login(botToken)

process.on('uncaughtException', error => {
	errorChannel?.send({files: [{attachment: Buffer.from(inspect(error, {depth: null}), 'utf-8'), name: 'error.ts'}]})
})