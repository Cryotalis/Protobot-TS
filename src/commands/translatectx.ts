import { MessageContextMenuCommandInteraction, EmbedBuilder, ContextMenuCommandBuilder, MessageFlags } from 'discord.js'
import { Translate } from '@google-cloud/translate/build/src/v2/index.js'
import { languageCodes } from '../data/languageCodes.js'

export const command = {
	data: new ContextMenuCommandBuilder()
		.setName('translate text')
		.setType(3)
	,
	async execute(interaction: MessageContextMenuCommandInteraction) {
        if (!interaction.targetMessage.content) {
			interaction.reply({ content: 'I could not find any text to translate.', flags: MessageFlags.Ephemeral })
			return
		}

		await interaction.deferReply({ flags: MessageFlags.Ephemeral })
		const gTranslate = new Translate({
			credentials: {
				client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
				private_key: process.env.GOOGLE_PRIVATE_KEY!
			}
		})
		const userLocale = /-/.test(interaction.locale) ? interaction.locale.match(/.+(?=-)/)![0] : interaction.locale
		const outputLanguage = languageCodes.find(lang => lang.code === userLocale)!
		const [_, translationObj] = await gTranslate.translate(interaction.targetMessage.content, outputLanguage.code)
		const translation = translationObj.data.translations[0]
		const detectedSourceLang = languageCodes.find(({code}) => code === translation.detectedSourceLanguage)?.name
								?? translation.detectedSourceLanguage
		
		const translateEmbed = new EmbedBuilder()
			.setColor('Blue')
			.addFields([
				{name: `Input (${detectedSourceLang})`, value: interaction.targetMessage.content},
				{name: `Output (${outputLanguage.name})`, value: translation.translatedText}
			])
			.setFooter({text: 'Google Translate', iconURL: 'https://i.imgur.com/vcZDlz7.png'})
		
		interaction.editReply({embeds: [translateEmbed]})
	}
}