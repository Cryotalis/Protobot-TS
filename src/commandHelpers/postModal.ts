import { TextInputBuilder, TextInputStyle, ModalBuilder, ActionRowBuilder } from 'discord.js'

const messageIDInput = new TextInputBuilder()
    .setCustomId('messageID')
    .setLabel('Enter a message ID (to edit a post instead)')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(30)
    .setRequired(false)

const postContentInput = new TextInputBuilder()
    .setCustomId('textContent')
    .setLabel('Enter the text content for your post')
    .setStyle(TextInputStyle.Paragraph)
    .setMaxLength(2000)
    .setRequired(false)

const imagesInput = new TextInputBuilder()
    .setCustomId('imageLinks')
    .setLabel('Enter image links separated by commas')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false)

const pinInput = new TextInputBuilder()
    .setCustomId('shouldPin')
    .setLabel('Pin this message?')
    .setPlaceholder('Yes/No')
    .setStyle(TextInputStyle.Short)
    .setRequired(false)

export function getPostModal(editMsgID: string = '') {
    return new ModalBuilder()
        .setCustomId('postModal')
        .setTitle('Post a Message')
        .addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(messageIDInput.setValue(editMsgID)),
            new ActionRowBuilder<TextInputBuilder>().addComponents(postContentInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(imagesInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(pinInput),
        )
}