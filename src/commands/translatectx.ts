import { MessageContextMenuCommandInteraction, EmbedBuilder, ContextMenuCommandBuilder } from 'discord.js'
import { Translate } from '@google-cloud/translate/build/src/v2'
import { languageCodes } from '../library'

module.exports = {
	data: new ContextMenuCommandBuilder()
		.setName('translate text')
		.setType(3)
	,
	async execute(interaction: MessageContextMenuCommandInteraction) {
        if (!interaction.targetMessage.content) return interaction.reply({content: 'I could not find any text to translate.', ephemeral: true})
		await interaction.deferReply({ephemeral: true})
		const gTranslate = new Translate({credentials: {client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!, private_key: process.env.GOOGLE_PRIVATE_KEY!}})
		const userLocale = /-/.test(interaction.locale) ? interaction.locale.match(/.+(?=-)/)![0] : interaction.locale
		const outputLanguage = languageCodes.find(lang => lang.code === userLocale)!
		const [translation] = (await gTranslate.translate(interaction.targetMessage.content, outputLanguage.code))[1].data.translations
		const detectedSourceLanguage = languageCodes.find(lang => lang.code === translation.detectedSourceLanguage) ?? translation.detectedSourceLanguage
		
		const translateEmbed = new EmbedBuilder()
			.setColor('Blue')
			.addFields([
				{name: `Input (${detectedSourceLanguage!.name})`, value: interaction.targetMessage.content},
				{name: `Output (${outputLanguage.name})`, value: translation.translatedText}
			])
			.setFooter({text: 'Google Translate', iconURL: 'https://i.imgur.com/vcZDlz7.png'})
		
		interaction.editReply({embeds: [translateEmbed]})
	}
}