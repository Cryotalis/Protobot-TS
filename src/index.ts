import { Client, Collection, GatewayIntentBits, VoiceChannel } from 'discord.js'
import { inspect } from 'util'
import { schedule } from 'node-cron'
import { registerFont } from 'canvas'
import { connectDatabase, loadDefenseBuilds } from './database/index.js'
import { BOT_TOKEN, CHANNEL_IDS } from './data/index.js'
import { registerCommands, sendToChannel } from './utils/index.js'
import { onInteractionCreate, onMessageCreate, onThreadCreate, onThreadUpdate } from './events/index.js'

import './cron/index.js'
import './events/index.js'

export const client: Client<boolean> & {commands?: Collection<unknown, unknown>} = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent
	], 
	rest: { timeout: 60000 }
})

export async function runStartup() {
	await connectDatabase()
	registerCommands()
	loadDefenseBuilds()
}
runStartup()

registerFont('assets/Arial.ttf', {family: 'Arial'})
registerFont('assets/Arial Bold.ttf', {family: 'Arial Bold'})

client.on('ready', async () => {
	client.user?.setActivity('/help')

	console.log('Protobot is now online')
	sendToChannel(CHANNEL_IDS.LOG, '**:white_check_mark:  Protobot is now online**')

	schedule('0 * * * *', runStartup)

	// Update Server Count every 30 minutes
	const serverCountChannel = await client.channels.fetch(CHANNEL_IDS.SERVER_COUNT) as VoiceChannel
	setInterval(() => serverCountChannel.edit({name: `Server Count: ${client.guilds.cache.size}`}), 1.8e+6)
})

client.on('interactionCreate', onInteractionCreate)
client.on('messageCreate', onMessageCreate)
client.on('threadCreate', onThreadCreate)
client.on('threadUpdate', onThreadUpdate)

client.login(BOT_TOKEN)

process.on('uncaughtException', error => {
	sendToChannel(
		CHANNEL_IDS.ERROR,
		{
			files: [{ attachment: Buffer.from(inspect(error, { depth: null })), name: 'error.ts' }]
		}
	)
})