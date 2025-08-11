import { ActionRowBuilder, Client, Collection, EmbedBuilder, GatewayIntentBits, Message, ModalBuilder, REST, Routes, TextChannel, TextInputBuilder, TextInputStyle } from 'discord.js'
import { inspect } from 'util'
import { readdirSync } from 'node:fs'
import { registerFont } from 'canvas'
import { connectDatabase } from './database/index.js'
import { loadDefenseBuilds } from './database/defenseBuilds.js'
import { onInteractionCreate, onMessageCreate, onThreadCreate, onThreadUpdate } from './events/index.js'

import './cron/index.js'
import './events/index.js'

const devMode = process.env.DEV_MODE === 'true'
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
export let automodLogChannel: TextChannel // The channel to send log messages to (Auto Mod Log Channel)
client.on('ready', async () => {
	client.user?.setActivity('/help')
	
	logChannel = client.channels.cache.get('577636091834662915') as TextChannel
	errorChannel = client.channels.cache.get('936833258149281862') as TextChannel
	modQueue = client.channels.cache.get('791527921142988832') as TextChannel
	automodLogChannel = client.channels.cache.get('916495567037816853') as TextChannel

	console.log('Protobot is now online')
	logChannel?.send('**:white_check_mark:  Protobot is now online**')

	// Update Server Count every 30 minutes
	const serverCountChannel = client.channels.cache.get('762948660983496715') as TextChannel
	setInterval(() => serverCountChannel.edit({name: `Server Count: ${client.guilds.cache.size}`}), 1.8e+6)
})

client.on('interactionCreate', onInteractionCreate)
client.on('messageCreate', onMessageCreate)
client.on('threadCreate', onThreadCreate)
client.on('threadUpdate', onThreadUpdate)

client.login(botToken)

process.on('uncaughtException', error => {
	errorChannel?.send({files: [{attachment: Buffer.from(inspect(error, {depth: null}), 'utf-8'), name: 'error.ts'}]})
})