import { CommandInteraction, MessageActionRow, Modal, ModalActionRowComponent, TextInputComponent } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('auction')
		.setDescription('Start an auction')
	,
	async execute(interaction: CommandInteraction) {
		return interaction.reply({content: 'This command has been temporarily disabled.', ephemeral: true})
		const auctionModal = new Modal()
			.setCustomId(`Auction Modal`)
			.setTitle('Start an Auction')
		
		const title = new MessageActionRow<ModalActionRowComponent>().addComponents(
			new TextInputComponent()
				.setCustomId('Title')
				.setLabel('Title')
				.setStyle('SHORT')
				.setMaxLength(100)
				.setRequired(true)
		)
		const description = new MessageActionRow<ModalActionRowComponent>().addComponents(
			new TextInputComponent()
				.setCustomId('Description')
				.setLabel(`Description`)
				.setStyle('PARAGRAPH')
				.setMaxLength(1024)
				.setRequired(true)
		)
		const minBid = new MessageActionRow<ModalActionRowComponent>().addComponents(
			new TextInputComponent()
				.setCustomId('Minimum Bid')
				.setLabel('Minimum Bid')
				.setStyle('SHORT')
				.setMaxLength(100)
				.setRequired(true)
		)
		const duration = new MessageActionRow<ModalActionRowComponent>().addComponents(
			new TextInputComponent()
				.setCustomId('Duration')
				.setLabel('Duration (7 Days max)')
				.setStyle('SHORT')
				.setPlaceholder('1 Day, 24 Hours, 60 Minutes')
				.setMaxLength(100)
				.setRequired(true)
		)
		const links = new MessageActionRow<ModalActionRowComponent>().addComponents(
			new TextInputComponent()
				.setCustomId('Links')
				.setLabel(`Links to images of your item (4 links max)`)
				.setStyle('PARAGRAPH')
				.setRequired(false)
		)

		auctionModal.addComponents(title, description, minBid, duration, links)
		await interaction.showModal(auctionModal)
	}
}