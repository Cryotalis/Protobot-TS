import { CommandInteraction, MessageActionRow, MessageAttachment, MessageSelectMenu } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import { findBestMatch } from 'string-similarity'
import { createCanvas, loadImage } from 'canvas'
import { defenseBuildData, defenseImages, shards } from '../index'
import { wrapText, drawCentered } from '../library'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('defense')
		.setDescription('Fetch a build from the DD2 Defense Build Guides spreadsheet')
		.addStringOption(option => option.setName('name').setDescription('The name of the defense').setRequired(true))
		.addStringOption(option => option.setName('role').setDescription('The role of the defense').setRequired(false))
	,
	async execute(interaction: CommandInteraction) {		
		async function generateBuildImage(){
			let defense = defenseBuildData.find((defense: defenseObject) => defense.name === defenseName && defense.role === defenseRole)
			const canvas = createCanvas(326, 378)
			const ctx = canvas.getContext('2d')
			
			/* Drawing the black background */
			ctx.fillStyle = 'black'
			ctx.fillRect(0, 0, 326, 378)
	
			/* Drawing the Defense Image */
			const defenseImage = await loadImage(defenseImages.find(def => def.defenseName === defense.name)?.defenseURL.toString())
			ctx.drawImage(defenseImage, 0, 0, 126, 126)
	
			/* Drawing the horizontal grey line */
			ctx.lineWidth = 4
			ctx.strokeStyle = '#434343'
			ctx.beginPath()
			ctx.moveTo(0, 124)
			ctx.lineTo(326, 125)
			ctx.stroke()
	
			/* Writing the Defense name and role*/
			wrapText(ctx, defense.name, 'center', 'bold 27px Arial', 'black', 'white', 229, 52, 200, 27)
			drawCentered(ctx, defense.role, 'bold 17px Arial', 'black', '#E06666', 229, 95)
	
			/* Drawing the icons for Shard and Relic */
			const shardIcon = await loadImage('https://i.imgur.com/phrdKZu.png')
			const relicIcon = await loadImage(defense.relic)
			ctx.drawImage(shardIcon, 13, 170)
			ctx.drawImage(relicIcon, 9, 293, 45, 45)
	
			/* Drawing the Shards and Shard Icons */
			let shardDropIcon1, shardDropIcon2, shardDropIcon3
			if (shards.find(shard => shard.name === defense.shards[0])) shardDropIcon1 = await loadImage(shards.find(shard => shard.name === defense.shards[0])?.dropURL.toString())
			if (shards.find(shard => shard.name === defense.shards[1])) shardDropIcon2 = await loadImage(shards.find(shard => shard.name === defense.shards[1])?.dropURL.toString())
			if (shards.find(shard => shard.name === defense.shards[2])) shardDropIcon3 = await loadImage(shards.find(shard => shard.name === defense.shards[2])?.dropURL.toString())
			if (shardDropIcon1) ctx.drawImage(shardDropIcon1, 80, 132, 30, 30)
			if (shardDropIcon2) ctx.drawImage(shardDropIcon2, 80, 174, 30, 30)
			if (shardDropIcon3) ctx.drawImage(shardDropIcon3, 80, 216, 30, 30)
			if (shardDropIcon1) wrapText(ctx, defense.shards[0], 'left', 'bold 22px Arial', 'black', 'white', 126, 147, 200, 20)
			if (shardDropIcon2) wrapText(ctx, defense.shards[1], 'left', 'bold 22px Arial', 'black', 'white', 126, 189, 200, 20)
			if (shardDropIcon3) wrapText(ctx, defense.shards[2], 'left', 'bold 22px Arial', 'black', 'white', 126, 231, 200, 20)
			if (defense.shards[2] === 'OR') wrapText(ctx, defense.shards[2], 'left', 'bold 22px Arial', 'black', 'white', 126, 252, 200, 20)

			/* Drawing the Mods and Qualibean Icons */
			let qualibean1, qualibean2, qualibean3
			const qualibeans = defenseImages.map(row => row.modURL)
			if (defense.mods[0].qualibean) qualibean1 = await loadImage(qualibeans[parseInt(defense.mods[0].qualibean)-1])
			if (defense.mods[1].qualibean) qualibean2 = await loadImage(qualibeans[parseInt(defense.mods[1].qualibean)-1])
			if (defense.mods[2].qualibean) qualibean3 = await loadImage(qualibeans[parseInt(defense.mods[2].qualibean)-1])
			if (defense.mods[0].qualibean) ctx.drawImage(qualibean1, 82, 254, 25, 37)
			if (defense.mods[1].qualibean) ctx.drawImage(qualibean2, 82, 297, 25, 37)
			if (defense.mods[2].qualibean) ctx.drawImage(qualibean3, 82, 339, 25, 37)
			if (defense.mods[0].name)      wrapText(ctx, defense.mods[0].name, 'left', 'bold 22px Arial', 'black', 'white', 126, 273, 200, 20)
			if (defense.mods[1].name)      wrapText(ctx, defense.mods[1].name, 'left', 'bold 22px Arial', 'black', 'white', 126, 315, 200, 20)
			if (defense.mods[2].name)      wrapText(ctx, defense.mods[2].name, 'left', 'bold 22px Arial', 'black', 'white', 126, 357, 200, 20)
	
			return new MessageAttachment(canvas.toBuffer('image/png'), `${defense.name}.png`)
		}

		const nameInput = interaction.options.getString('name')!
		const roleInput = interaction.options.getString('role')
	
		interface defenseObject {name: string, role: string, shards: string[], mods: {name: string, qualibean: string}[], relic: string}
		let defenseName = findBestMatch(nameInput, defenseBuildData.map((defense: defenseObject) => defense.name)).bestMatch.target
		let defenseRole = findBestMatch(String(roleInput), defenseBuildData.filter((defense: defenseObject) => defense.name === defenseName).map((defense: defenseObject) => defense.role)).bestMatch.target
	
		if (!roleInput && defenseBuildData.filter((defense: defenseObject) => defense.name === defenseName).length > 1){
			let roleOptions = defenseBuildData.filter((defense: defenseObject) => defense.name === defenseName).map((defense: defenseObject) => defense.role)
			roleOptions = [...new Set(roleOptions)]
			const menu = new MessageActionRow()
				.addComponents(
					new MessageSelectMenu()
						.setCustomId('Defense Build Selector')
						.setPlaceholder('Select a build')
						.addOptions(roleOptions.map((option: string) => ({label: option, value: option})))
				)
			await interaction.reply({content: 'Please select a build:', components: [menu]}).then(() => {
				const collector = interaction.channel?.createMessageComponentCollector({componentType: 'SELECT_MENU', filter: msg => msg.member?.user.id === interaction.member?.user.id, time: 30000, max: 1})
				collector?.on('collect', async i => {
					defenseRole = i.values[0]
					await interaction.editReply({content: null, components: [], files: [await generateBuildImage()]})
				})
			})      
		} else {
			return await interaction.reply({files: [await generateBuildImage()]})
		}
	}
}