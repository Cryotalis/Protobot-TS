import { CommandInteraction, MessageActionRow, Modal, ModalActionRowComponent, TextChannel, TextInputComponent } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('report')
		.setDescription('Report a bug or submit feedback for a Dungeon Defenders game. Your Discord ID will be collected')
		.addStringOption(option => option.setName('show-name')
			.setDescription('Show your name on the feedback or bug report?')
			.addChoice('Yes', 'Yes')
			.addChoice('No', 'No')
			.setRequired(false))
	,
	async execute(interaction: CommandInteraction) {
		if (interaction.guildId !== '98499414632448000') return await interaction.reply('This command is only usable in the official Dungeon Defenders Discord server.')
		const channelName = (interaction.channel as TextChannel).name
		const isFeedback = /feedback/i.test(channelName) ? true : false
		const anonymous = interaction.options.getString('show-name') === 'Yes' ? '' : 'Anonymous'
		const ddGame = channelName.match(/dd(?:gr|a|2)/i)?.toString() || 'dd2'

		const titlePlaceholders: {[char: string]: string} = {
			'ddgr': 'Example: With enough extra Jump Runes you can get out of the map on Summit',
			'dda': 'Example: Squire can get stuck on Lava Mines',
			'dd2': 'Example: Mobs are getting stuck in spawn'
		}

		const gameModePlaceholders: {[char: string]: string} = {
			'ddgr': 'Example: Hard Summit',
			'dda': 'Example: Nightmare Campaign Deeper Well',
			'dd2': 'Example: Chaos 9 Expeditions Tornado Highlands'
		}
		
		const modal = new Modal()
			.setCustomId(`${anonymous} ${ddGame} ${isFeedback ? 'Feedback Form' : 'Bug Report Form'}`)
			.setTitle(isFeedback ? 'Feedback' : 'Bug Report')
		
		const title = new MessageActionRow<ModalActionRowComponent>().addComponents(
			new TextInputComponent()
				.setCustomId('Report Title')
				.setLabel('Title')
				.setPlaceholder(isFeedback ? '' : titlePlaceholders[ddGame])
				.setStyle('SHORT')
				.setMaxLength(100)
				.setRequired(true)
		)
		const description = new MessageActionRow<ModalActionRowComponent>().addComponents(
			new TextInputComponent()
				.setCustomId('Report Description')
				.setLabel(`Provide a brief ${isFeedback ? '' : 'bug '}description:`)
				.setStyle('PARAGRAPH')
				.setMaxLength(1024)
				.setRequired(true)
		)
		const bugRepro = new MessageActionRow<ModalActionRowComponent>().addComponents(
			new TextInputComponent()
				.setCustomId('Bug Reproduction Steps')
				.setLabel('Steps to reproduce the bug (if possible)')
				.setStyle('PARAGRAPH')
				.setMaxLength(1024)
				.setRequired(false)
		)
		const gameMode = new MessageActionRow<ModalActionRowComponent>().addComponents(
			new TextInputComponent()
				.setCustomId('Game Mode')
				.setLabel('Game Mode, Map, or Difficulty (If applicable)')
				.setPlaceholder(gameModePlaceholders[ddGame])
				.setStyle('SHORT')
				.setMaxLength(1024)
				.setRequired(false)
		)
		const links = new MessageActionRow<ModalActionRowComponent>().addComponents(
			new TextInputComponent()
				.setCustomId('Links')
				.setLabel(`Links to photos/videos ${isFeedback ? 'for your feedback' : 'of the bug'}`)
				.setPlaceholder('Up to 8 image links and any number of video links may be included.')
				.setStyle('PARAGRAPH')
				.setRequired(false)
		)

		modal.addComponents(title, description)
		if (!isFeedback) modal.addComponents(bugRepro, gameMode)
		modal.addComponents(links)
		await interaction.showModal(modal)
	}
}