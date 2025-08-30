import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'

export const command = {
	data: new SlashCommandBuilder()
		.setName('twitch')
		.setDescription('Configure Twitch Live notifications for this channel')
		.addSubcommand(subcommand => 
			subcommand
				.setName('add')
				.setDescription('Turn on notifications for a twitch channel.')
				.addStringOption(option => option.setName('username').setDescription('Twitch channel username').setRequired(true))
				.addChannelOption(option => option.setName('channel').setDescription('The Discord Channel to send notifications to').setRequired(true))
				.addStringOption(option => option.setName('message').setDescription('Custom message to send with the notification'))
				.addStringOption(option => option.setName('categories').setDescription("Categories you'd like to receive notifications for"))
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('remove')
				.setDescription('Turn off notifications for a twitch channel')
				.addStringOption(option => option.setName('username').setDescription('Twitch channel username').setRequired(true))
				.addChannelOption(option => option.setName('channel').setDescription('The Discord Channel to disable notifications in').setRequired(true))
		)
	,
	async execute(interaction: ChatInputCommandInteraction) {
		return interaction.reply('Command not yet available.')
		// const twitchUsername = interaction.options.getString('username')!
		// const discordChannel = interaction.options.getChannel('channel')!
		// const customMessage = interaction.options.getString('message')
		// const categories = interaction.options.getString('categories')
		// const command = interaction.options.getSubcommand()

		// const twitchUser = await getTwitchUserInfo(twitchUsername, 0) as userInfo
		// if (!twitchUser) return interaction.reply('This Twitch User does not exist!')

		// const channelEntry = twitchChannels.find(channel => channel.username === twitchUsername)
		// if (channelEntry){
		// 	const configs: channelConfig[] = JSON.parse(channelEntry.configs || '[]')
		// 	if (command === 'add'){
		// 		configs.push({
		// 			id: discordChannel.id,
		// 			message: customMessage,
		// 			categories: categories ? categories.split(',') : []
		// 		})
		// 	} else {
		// 		const targetDiscordChannel = configs.find(channel => channel.id === discordChannel.id)
		// 		if (targetDiscordChannel) configs.splice(configs.indexOf(targetDiscordChannel))
		// 	}
		// 	channelEntry.configs = JSON.stringify(configs)
		// 	await channelEntry.save()
		// } else if (command === 'add') {
		// 	const newEntry = await privateDB.sheetsByTitle['Twitch Live Notifications'].addRow({
		// 		username: twitchUsername,
		// 		recentStreamIDs: '[]',
		// 		configs: JSON.stringify([{
		// 			id: discordChannel.id,
		// 			message: customMessage,
		// 			categories: categories ? categories.split(',') : []
		// 		}])
		// 	})
		// 	twitchChannels.push(newEntry)
		// }
		// return interaction.reply(`Notifications have been ${command === 'add' ? 'enabled' : 'disabled'} for \`${twitchUsername}\`!`)
	}
}