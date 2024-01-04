/**
 * This file contains instructions on how to register and delete Slash Commands (global & guild-specific methods are both included)
 */

import { REST, Routes } from 'discord.js'
import fs from 'node:fs'

const clientUserID = 'Your_Client_ID_Here'
const guildID = 'Your_Guild_ID_Here'
const rest = new REST({ version: '9' }).setToken('Your_Bot_Token')

/* This portion gathers your Slash Commands together so that they can be registered */
const commands: any = []
const commandFiles = fs.readdirSync('./path/to/your/slash/commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
	const command = require(`./path/to/your/slash/commands/${file}`)
	commands.push(command.data.toJSON())
}

/* To register Slash Commands Globally */
rest.put(Routes.applicationCommands(clientUserID), { body: commands })
	.then(() => console.log('Successfully registered application commands globally.'))
	.catch(console.error)

/* To delete global Slash Commands */
rest.get(Routes.applicationCommands(clientUserID))
.then((data: any) => {
	const promises = []
	for (const command of data) {
		const deleteUrl: any = `${Routes.applicationCommands(clientUserID)}/${command.id}`
		promises.push(rest.delete(deleteUrl))
	}
	console.log('Deleted all global application commands.')
	return Promise.all(promises)
})

/* To register Slash Commands to a specific Guild (Server) */
rest.put(Routes.applicationGuildCommands(clientUserID, guildID), { body: commands })
	.then(() => console.log('Successfully registered application commands to Your_Specific_Guild.'))
	.catch(console.error)

/* To delete Guild-specific Slash Commands */
rest.get(Routes.applicationGuildCommands(clientUserID, guildID))
.then((data: any) => {
	const promises = []
	for (const command of data) {
		const deleteUrl: any = `${Routes.applicationGuildCommands(clientUserID, guildID)}/${command.id}`
		promises.push(rest.delete(deleteUrl))
	}
	console.log('Deleted all application commands in Your_Specific_Guild.')
	return Promise.all(promises)
})