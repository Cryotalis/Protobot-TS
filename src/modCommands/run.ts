import { CommandInteraction } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import { botSettings, isHost, councilMemberTags, connectToDB, loadDefenseBuilds, registerCommands } from '../index'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('run')
		.setDescription('Run administrator level Protobot commands (reserved for Council Members only)')
		.addSubcommand(option => 
			option
				.setName('startup')
				.setDescription('Runs loadDefenseBuilds, connectToDB, and registerCommands.')
		)
		.addSubcommand(option => 
			option
				.setName('connect_database')
				.setDescription('Connects to the Database and updates all current data.')
		)
		.addSubcommand(option => 
			option
				.setName('load_defenses')
				.setDescription('Loads Defense Builds from the DD2 Defense Build Guides sheet for use with the /defense command.')
		)
		.addSubcommand(option => 
			option
				.setName('register_commands')
				.setDescription('Registers and updates all Slash Commands.')
		)
		.addSubcommand(option => 
			option
				.setName('developer_mode')
				.setDescription('Toggles Developer Mode, which ignores commands issued from Developers to the Host.')
		)
	,
	async execute(interaction: CommandInteraction) {
		if (!councilMemberTags?.includes(interaction.user.tag)) {
			return interaction.reply('This command is reserved for Protobot Council Members only.')
		}

		const command = interaction.options.getSubcommand()

		if (command === 'startup'){
			await Promise.all([
				interaction.reply('Connecting to Database and Loading Defense Builds <a:loading:763160594974244874>'),
				loadDefenseBuilds(),
				connectToDB()
			])
			await Promise.all([
				interaction.editReply('Registering Commands <a:loading:763160594974244874>'),
				registerCommands()
			])
			interaction.editReply('Startup Completed.')
		}

		if (command === 'connectToDB'){
			await Promise.all([
				interaction.reply('Connecting to Database <a:loading:763160594974244874>'),
				connectToDB()
			])
			interaction.editReply('Database Connection Successful.')
		}

		if (command === 'loadDefenseBuilds'){
			await Promise.all([
				interaction.reply('Loading Defense Builds <a:loading:763160594974244874>'),
				loadDefenseBuilds()
			])
			interaction.editReply('Defense Builds Loaded.')
		}

		if (command === 'registerCommands'){
			await Promise.all([
				interaction.reply('Registering Commands <a:loading:763160594974244874>'),
				registerCommands()
			])
			interaction.editReply('Commands Registered.')
		}

		if (command === 'developerMode'){
			if (!isHost) return interaction.reply('This command cannot be used on the local build')
			if (interaction.user.id !== '251458435554607114') return interaction.reply('You do not have permission to use this command.')
			botSettings.developerMode = !botSettings.developerMode
			interaction.reply(`Developer Mode has been set to ${botSettings.developerMode}`)
		}
	}
}