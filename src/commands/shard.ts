import { ChatInputCommandInteraction, ActionRowBuilder, EmbedBuilder, ComponentType, ButtonBuilder, ButtonStyle, SlashCommandBuilder } from 'discord.js'
import { client } from '../index.js'
import { database } from '../database/index.js'
import { heroEmotes } from '../data/discord.js'
import { findBestCIMatch } from '../utils/string.js'

export const command = {
	data: new SlashCommandBuilder()
		.setName('shard')
		.setDescription('Fetch information about a shard in DD2')
        .addStringOption(option => option.setName('name').setDescription('The name of the shard').setRequired(true))
    ,
	async execute(interaction: ChatInputCommandInteraction) {
        const userInput = interaction.options.getString('name')!
		const shardNames = database.shards.map(shard => shard.get('name'))
        const modNames = database.mods.map(mod => mod.get('name'))
        const shardBestMatch = findBestCIMatch(userInput, shardNames).bestMatch
        const modBestMatch = findBestCIMatch(userInput, modNames).bestMatch
        const shard = database.shards.find(shard => shard.get('name') === shardBestMatch.target)!

        const shardEmbed = new EmbedBuilder()
            .setColor('Blue')
            .setAuthor({name: shard.get('name'), iconURL: shard.get('dropURL')})
            .setThumbnail(shard.get('image'))
            .setDescription(shard.get('description'))
            .addFields([
                {name: 'Gilded: ', value: shard.get('gilded'), inline: false},
                {name: 'Usable by:', value: shard.get('hero').split(', ').map((hero: string) => heroEmotes[hero]).join(''), inline: false}
            ])
            .setFooter({text: `Upgrade Levels: ${shard.get('upgradeLevels')} | ${shard.get('type')} | ${shard.get('drop')}`})

        const suggestionButton = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('primary')
                    .setLabel(`Looking for ${modBestMatch.target} (the mod)?`)
                    .setStyle(ButtonStyle.Primary)
            )
        
        // TODO: This is deprecated
        await interaction.reply({embeds: [shardEmbed], components: modBestMatch.rating > shardBestMatch.rating ? [suggestionButton] : [], fetchReply: true}).then(async msg => {
            if (modBestMatch.rating <= shardBestMatch.rating) return
            const collector = (await interaction.fetchReply()).createMessageComponentCollector({componentType: ComponentType.Button, filter: msg => msg.user.id === interaction.member?.user.id, time: 30000})
            collector?.on('collect', async () => {
                await interaction.editReply({content: '```/mod name: ' + modBestMatch.target + '```', embeds: [], components: [], allowedMentions: {repliedUser: false}})
                const command = require('../messageCommands/mod.js')
                command.run(client, msg, '/', [modBestMatch.target]) 
            })
        })
	}
}