import { Collection, REST, Routes } from 'discord.js'
import { readdirSync } from 'fs'
import { client, botID, botToken } from '../index.js'

const homeServerID = '379501550097399810'
export const regCommands = readdirSync('./prod/commands')
export const modCommands = readdirSync('./prod/modCommands')
export const commandFiles = [...regCommands, ...modCommands]
export const privateCommandFiles = ['run.js', 'say.js']

export async function registerCommands() {
    const commands = []
    const privateCommands = []              // Administrator level commands only usable by privileged users
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
    rest.put(Routes.applicationGuildCommands(botID, homeServerID), { body: privateCommands })
}