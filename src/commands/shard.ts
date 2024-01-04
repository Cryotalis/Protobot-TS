import { ChatInputCommandInteraction, ActionRowBuilder, EmbedBuilder, ComponentType, ButtonBuilder, ButtonStyle, SlashCommandBuilder } from 'discord.js'
import { shards, mods, client } from '../index'
import { findBestCIMatch, heroEmotes } from '../library'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shard')
		.setDescription('Fetch information about a shard in DD2')
        .addStringOption(option => option.setName('name').setDescription('The name of the shard').setRequired(true))
    ,
	async execute(interaction: ChatInputCommandInteraction) {
        const userInput = interaction.options.getString('name')!
		const shardNames = shards.map(shard => shard.name)
        const modNames = mods.map(mod => mod.name)
        const shardBestMatch = findBestCIMatch(userInput, shardNames).bestMatch
        const modBestMatch = findBestCIMatch(userInput, modNames).bestMatch
        const shard = shards.find(shard => shard.name === shardBestMatch.target)!

        const shardEmbed = new EmbedBuilder()
            .setColor('Blue')
            .setAuthor({name: shard.name, iconURL: shard.dropURL})
            .setThumbnail(shard.image)
            .setDescription(shard.description)
            .addFields([
                {name: 'Gilded: ', value: shard.gilded, inline: false},
                {name: 'Usable by:', value: shard.hero.split(', ').map((hero: string) => heroEmotes[hero]).join(''), inline: false}
            ])
            .setFooter({text: `Upgrade Levels: ${shard.upgradeLevels} | ${shard.type} | ${shard.drop}`})

        const suggestionButton = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('primary')
                    .setLabel(`Looking for ${modBestMatch.target} (the mod)?`)
                    .setStyle(ButtonStyle.Primary)
            )
        
        await interaction.reply({embeds: [shardEmbed], components: modBestMatch.rating > shardBestMatch.rating ? [suggestionButton] : [], fetchReply: true}).then(msg => {
            if (modBestMatch.rating <= shardBestMatch.rating) return
            const collector = interaction.channel?.createMessageComponentCollector({componentType: ComponentType.Button, filter: msg => msg.member?.user.id === msg.member?.user.id, time: 30000})
            collector?.on('collect', async () => {
                await interaction.editReply({content: `/mod name: ${modBestMatch.target}`, embeds: [], components: [], allowedMentions: {repliedUser: false}})
                const command = require('../messageCommands/mod')
                command.run(client, msg, '/', [modBestMatch.target]) 
            })
        })
	}
}