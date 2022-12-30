import { CommandInteraction, MessageEmbed } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import { findBestMatch } from 'string-similarity'
import { Translate } from '@google-cloud/translate/build/src/v2'
import { languageCodes } from '../library'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('translate')
		.setDescription('Translates text to another language. (Translates to your set language by default)')
		.addStringOption(option => option.setName('text').setDescription('The text to be translated').setRequired(true))
		.addStringOption(option => option.setName('from').setDescription('The language of the text. (Language will be auto-detected otherwise)'))
		.addStringOption(option => option.setName('to').setDescription('The language to translate the text to'))
	,
	async execute(interaction: CommandInteraction) {
		await interaction.deferReply()
		const textInput = interaction.options.getString('text')!
		const sourceLangInput = interaction.options.getString('from')?.toLowerCase()
		const outputLangInput = interaction.options.getString('to')?.toLowerCase()
		const userLocale = /-/.test(interaction.locale) ? interaction.locale.match(/.+(?=-)/)![0] : interaction.locale
		const gTranslate = new Translate({credentials: {client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!, private_key: process.env.GOOGLE_PRIVATE_KEY!}})
		
		const sourceLangBestMatch = findBestMatch(String(sourceLangInput), languageCodes.map(lang => lang.name.toLowerCase())).bestMatch.target
		const outputLangBestMatch = findBestMatch(String(outputLangInput), languageCodes.map(lang => lang.name.toLowerCase())).bestMatch.target
		const sourceLanguage = languageCodes.find(lang => lang.name.toLowerCase() === sourceLangBestMatch)!
		const outputLanguage = outputLangInput
			? languageCodes.find(lang => lang.name.toLowerCase() === outputLangBestMatch)!
			: languageCodes.find(lang => lang.code === userLocale)!
		const [translation] = (await gTranslate.translate(textInput, {from: sourceLangInput ? sourceLanguage.code : '', to: outputLanguage.code}))[1].data.translations
		const detectedSourceLanguage = languageCodes.find(lang => lang.code === translation.detectedSourceLanguage) ?? translation.detectedSourceLanguage
		
		const translateEmbed = new MessageEmbed()
			.setColor('BLUE')
			.addField(`Input (${sourceLangInput ? sourceLanguage.name : detectedSourceLanguage!.name})`, textInput)
			.addField(`Output (${outputLanguage.name})`, translation.translatedText)
			.setFooter({text: 'Google Translate', iconURL: 'https://i.imgur.com/vcZDlz7.png'})
		
		interaction.editReply({embeds: [translateEmbed]})
	}
}