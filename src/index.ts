import { Client, Collection, GatewayIntentBits, TextChannel } from 'discord.js'
import { inspect } from 'util'
import { schedule } from 'node-cron'
import { registerFont } from 'canvas'
import { connectDatabase, loadDefenseBuilds } from './database/index.js'
import { BOT_TOKEN } from './data/index.js'
import { registerCommands } from './utils/index.js'
import { onInteractionCreate, onMessageCreate, onThreadCreate, onThreadUpdate } from './events/index.js'

import './cron/index.js'
import './events/index.js'

export const client: Client<boolean> & {commands?: Collection<unknown, unknown>} = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent], rest: {timeout: 60000}})

async function runStartup() {
	await connectDatabase()
	registerCommands()
	loadDefenseBuilds()
}
runStartup()

registerFont('assets/Arial.ttf', {family: 'Arial'})
registerFont('assets/Arial Bold.ttf', {family: 'Arial Bold'})

export let logChannel: TextChannel
export let errorChannel: TextChannel
export let automodLogChannel: TextChannel // The channel to send log messages to (Auto Mod Log Channel)
client.on('ready', async () => {
	client.user?.setActivity('/help')
	
	logChannel = client.channels.cache.get('577636091834662915') as TextChannel
	errorChannel = client.channels.cache.get('936833258149281862') as TextChannel
	automodLogChannel = client.channels.cache.get('916495567037816853') as TextChannel

	console.log('Protobot is now online')
	logChannel?.send('**:white_check_mark:  Protobot is now online**')

	schedule('0 * * * *', runStartup)

	// Update Server Count every 30 minutes
	const serverCountChannel = client.channels.cache.get('762948660983496715') as TextChannel
	setInterval(() => serverCountChannel.edit({name: `Server Count: ${client.guilds.cache.size}`}), 1.8e+6)
})

client.on('interactionCreate', onInteractionCreate)
client.on('messageCreate', onMessageCreate)
client.on('threadCreate', onThreadCreate)
client.on('threadUpdate', onThreadUpdate)

client.login(BOT_TOKEN)

process.on('uncaughtException', error => {
	errorChannel?.send({files: [{attachment: Buffer.from(inspect(error, {depth: null}), 'utf-8'), name: 'error.ts'}]})
})