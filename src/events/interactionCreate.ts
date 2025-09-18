import { CacheType, Interaction, MessageFlags } from 'discord.js'
import { client } from '../index.js'
import { sendToChannel } from '../utils/discord.js'
import { CHANNEL_IDS } from '../data/discord.js'
import { isBlacklisted } from '../database/helpers.js'

export function onInteractionCreate(interaction: Interaction<CacheType>) {
    // Slash Commands & Context Menu Commands
    if (interaction.isCommand() || interaction.isMessageContextMenuCommand()) {
        if (isBlacklisted(interaction.user.id)) {
            interaction.reply(`${interaction.user} you have been banned running commands.`)
            return
        }
    
        const command = client.commands.get(interaction.commandName)
        if (!command) {
            interaction.reply({
                content: 'Failed to load command. Please try again later.',
                flags: MessageFlags.Ephemeral
            })
            return
        }

        const logMessage = `**${interaction.user.tag}** ran the command \`${interaction.commandName}\` `
                         + `in **${interaction.guild?.name ?? 'Direct Messages'}**`

        command.execute(interaction)
        sendToChannel(CHANNEL_IDS.LOG, `:scroll:  ${logMessage} (${interaction.guildId ?? interaction.channelId})`)
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
