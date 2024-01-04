// import { ChatInputCommandInteraction, ActionRowBuilder, Modal, ModalActionRowComponent, TextInputComponent, SlashCommandBuilder } from 'discord.js'

// module.exports = {
// 	data: new SlashCommandBuilder()
// 		.setName('auction')
// 		.setDescription('Start an auction')
// 	,
// 	async execute(interaction: ChatInputCommandInteraction) {
// 		return interaction.reply({content: 'This command has been temporarily disabled.', ephemeral: true})
// 		const auctionModal = new Modal()
// 			.setCustomId(`Auction Modal`)
// 			.setTitle('Start an Auction')
		
// 		const title = new ActionRowBuilder<ModalActionRowComponent>().addComponents(
// 			new TextInputComponent()
// 				.setCustomId('Title')
// 				.setLabel('Title')
// 				.setStyle('SHORT')
// 				.setMaxLength(100)
// 				.setRequired(true)
// 		)
// 		const description = new ActionRowBuilder<ModalActionRowComponent>().addComponents(
// 			new TextInputComponent()
// 				.setCustomId('Description')
// 				.setLabel(`Description`)
// 				.setStyle('PARAGRAPH')
// 				.setMaxLength(1024)
// 				.setRequired(true)
// 		)
// 		const minBid = new ActionRowBuilder<ModalActionRowComponent>().addComponents(
// 			new TextInputComponent()
// 				.setCustomId('Minimum Bid')
// 				.setLabel('Minimum Bid')
// 				.setStyle('SHORT')
// 				.setMaxLength(100)
// 				.setRequired(true)
// 		)
// 		const duration = new ActionRowBuilder<ModalActionRowComponent>().addComponents(
// 			new TextInputComponent()
// 				.setCustomId('Duration')
// 				.setLabel('Duration (7 Days max)')
// 				.setStyle('SHORT')
// 				.setPlaceholder('1 Day, 24 Hours, 60 Minutes')
// 				.setMaxLength(100)
// 				.setRequired(true)
// 		)
// 		const links = new ActionRowBuilder<ModalActionRowComponent>().addComponents(
// 			new TextInputComponent()
// 				.setCustomId('Links')
// 				.setLabel(`Links to images of your item (4 links max)`)
// 				.setStyle('PARAGRAPH')
// 				.setRequired(false)
// 		)

// 		auctionModal.addComponents(title, description, minBid, duration, links)
// 		await interaction.showModal(auctionModal)
// 	}
// }