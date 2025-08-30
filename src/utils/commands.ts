import { REST, Routes } from 'discord.js'
import { readdirSync } from 'fs'
import { client } from '../index.js'
import { BOT_ID, BOT_TOKEN, HOME_SERVER_ID } from '../data/index.js'

const regCommands = readdirSync('./prod/commands')
const modCommands = readdirSync('./prod/modCommands')
const commandFiles = [...regCommands, ...modCommands]
const privateCommandFiles = ['run.js', 'say.js']

export function isModCommand(name: string) { return modCommands.includes(name) }

export async function registerCommands() {
    const commands = []
    const privateCommands = []              // Administrator level commands only usable by privileged users

    for (const file of commandFiles) {
        const { command } = regCommands.includes(file)
            ? await import(`./commands/${file}`)
            : await import(`./modCommands/${file}`)

        privateCommandFiles.includes(file)
            ? privateCommands.push(command.data.toJSON())
            : commands.push(command.data.toJSON())

        client.commands.set(command.data.name, command)
    }

    const rest = new REST({ version: '9' }).setToken(BOT_TOKEN)
    rest.put(Routes.applicationCommands(BOT_ID), { body: commands })
    rest.put(Routes.applicationGuildCommands(BOT_ID, HOME_SERVER_ID), { body: privateCommands })
}