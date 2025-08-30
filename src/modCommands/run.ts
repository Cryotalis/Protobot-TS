import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { connectDatabase, database } from '../database/index.js'
import { loadDefenseBuilds } from '../database/defenseBuilds.js'
import { runStartup } from '../index.js'
import { registerCommands } from '../utils/commands.js'

export const command = {
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
	,
	async execute(interaction: ChatInputCommandInteraction) {
		if (!database.contributors.find(u => u.get('id') === interaction.user.id)) {
			return interaction.reply('This command is reserved for Protobot Council Members only.')
		}

		const command = interaction.options.getSubcommand()

		if (command === 'startup'){
			interaction.reply('Running startup functions <a:loading:763160594974244874>'),
			await runStartup()
			interaction.editReply('Startup Completed.')
		}

		if (command === 'connect_database'){
			interaction.reply('Connecting to Database <a:loading:763160594974244874>'),
			await connectDatabase()
			interaction.editReply('Database Connection Successful.')
		}

		if (command === 'load_defenses'){
			interaction.reply('Loading Defense Builds <a:loading:763160594974244874>'),
			await loadDefenseBuilds()
			interaction.editReply('Defense Builds Loaded.')
		}

		if (command === 'register_commands'){
			interaction.reply('Registering Commands <a:loading:763160594974244874>'),
			await registerCommands()
			interaction.editReply('Commands Registered.')
		}
	}
}