import { inspect } from "util";
import { database } from "../database/index.js";
import { client, modCommands, errorChannel, logChannel } from "../index.js";
import { CacheType, Interaction } from "discord.js";

// Slash Command Handler
export function onInteractionCreate(interaction: Interaction<CacheType>) {
    if (interaction.isCommand() || interaction.isMessageContextMenuCommand()) {
        if (database.blacklist.find(user => user.get('id') === interaction.user.id)) {interaction.reply(`${interaction.user} you have been banned running commands.`); return}
    
        const isModCommand = modCommands.includes(`${interaction.commandName}.js`)
        // TODO: REMOVE THIS ANY!!!
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
    }

    // if (interaction.isButton()) {
    //     if (interaction.customId === 'Helper Application Button'){
    //         const helperAppPart1 = new ModalBuilder()
    //             .setCustomId('Helper Application Modal')
    //             .setTitle('Helper Application')
    //             .addComponents(
    //                 new ActionRowBuilder<TextInputBuilder>()
    //                 .addComponents(
    //                     new TextInputBuilder()
    //                         .setCustomId('Helper Reason')
    //                         .setLabel('Why are you interested in becoming a Helper?')
    //                         .setStyle(TextInputStyle.Paragraph)
    //                         .setMaxLength(1000)
    //                         .setRequired(true)
    //                 )
    //                 .addComponents(
    //                     new TextInputBuilder()
    //                         .setCustomId('DD Game')
    //                         .setLabel('Which DD Game are you most experienced with?')
    //                         .setPlaceholder('DD1 / DD2 / DDA / etc.')
    //                         .setStyle(TextInputStyle.Short)
    //                         .setRequired(true)
    //                 )
    //                 .addComponents(
    //                     new TextInputBuilder()
    //                         .setCustomId('DD Game Hours')
    //                         .setLabel('Around how many hours have you logged?')
    //                         .setPlaceholder('The approximate number of hours you\'ve spent in the DD game you\'re most experienced with.')
    //                         .setStyle(TextInputStyle.Short)
    //                         .setRequired(true)
    //                 )
    //                 .addComponents(
    //                     new TextInputBuilder()
    //                         .setCustomId('DD Game Solo')
    //                         .setLabel('What is the hardest content you can do solo?')
    //                         .setPlaceholder('The hardest content you can consistently solo in the DD game you\'re most experienced with.')
    //                         .setStyle(TextInputStyle.Short)
    //                         .setRequired(true)
    //                 )
    //                 .addComponents(
    //                     new TextInputBuilder()
    //                         .setCustomId('DD Game Knowledge')
    //                         .setLabel('Rate your knowledge of your chosen DD game.')
    //                         .setPlaceholder('Rate your knowledge on a scale from 0 to 10. 0 means you know nothing, 10 means you know everything.')
    //                         .setStyle(TextInputStyle.Short)
    //                         .setRequired(true)
    //                 )
    //             )
        
    //         await interaction.showModal(helperAppPart1)
    //     }
        
    //     if (interaction.customId === 'Content Creator Button'){
    //         const contentCreatorModal = new ModalBuilder()
    //             .setCustomId('Content Creator Modal')
    //             .setTitle('Content Creator Role Request')
    //             .addComponents(
    //                 new ActionRowBuilder<TextInputBuilder>()
    //                 .addComponents(
    //                     new TextInputBuilder()
    //                         .setCustomId('Channel Link')
    //                         .setLabel('Please provide a link to your channel')
    //                         .setPlaceholder('YouTube/Twitch Channel Link')
    //                         .setStyle(TextInputStyle.Paragraph)
    //                         .setRequired(true)
    //                 )
    //             )
        
    //         await interaction.showModal(contentCreatorModal)
    //     }
        
    //     if (interaction.customId === 'Defender Role Button'){
            
    //     }
    // }
    
}
