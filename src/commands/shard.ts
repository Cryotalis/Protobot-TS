import { CommandInteraction, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import { findBestMatch } from 'string-similarity'
import { shards, mods, client } from '../index'
import { heroEmotes } from '../library'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shard')
		.setDescription('Fetch information about a shard in DD2')
        .addStringOption(option => option.setName('name').setDescription('The name of the shard').setRequired(true))
    ,
	async execute(interaction: CommandInteraction) {
        const userInput = interaction.options.getString('name')!
		const shardNames = shards.map(shard => shard.name)
        const modNames = mods.map(mod => mod.name)
        const shardBestMatch = findBestMatch(userInput, shardNames).bestMatch
        const modBestMatch = findBestMatch(userInput, modNames).bestMatch
        const shard = shards.find(shard => shard.name === shardBestMatch.target)!

        const shardEmbed = new MessageEmbed()
            .setColor('ORANGE')
            .setAuthor({name: shard.name, iconURL: shard.dropURL})
            .setThumbnail(shard.image)
            .setDescription(shard.description)
            .addField('Gilded: ', shard.gilded, false)
            .addField('Usable by:', shard.hero.split(', ').map((hero: string) => heroEmotes[hero]).join(""), false)
            .setFooter({text: `Upgrade Levels: ${shard.upgradeLevels} | ${shard.type} | ${shard.drop}`})

        const suggestionButton = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('primary')
                    .setLabel(`Looking for ${modBestMatch.target} (the mod)?`)
                    .setStyle('PRIMARY')
            )
        
        await interaction.reply({embeds: [shardEmbed], components: modBestMatch.rating > shardBestMatch.rating ? [suggestionButton] : [], fetchReply: true}).then(msg => {
            if (modBestMatch.rating <= shardBestMatch.rating) return
            const collector = interaction.channel?.createMessageComponentCollector({componentType: 'BUTTON', filter: msg => msg.member?.user.id === msg.member?.user.id, time: 30000})
            collector?.on('collect', async () => {
                await interaction.editReply({content: `/mod name: ${modBestMatch.target}`, embeds: [], components: [], allowedMentions: {repliedUser: false}})
                const command = require('../messageCommands/mod')
                command.run(client, msg, '/', [modBestMatch.target]) 
            })
        })
	}
}