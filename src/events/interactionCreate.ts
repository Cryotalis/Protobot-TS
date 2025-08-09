import { inspect } from "util";
import { database } from "../database/index.js";
import { client, modCommands, errorChannel, logChannel } from "../index.js";

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