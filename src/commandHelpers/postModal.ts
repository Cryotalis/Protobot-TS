import { TextInputBuilder, TextInputStyle, ModalBuilder, LabelBuilder, FileUploadBuilder, StringSelectMenuBuilder } from 'discord.js'

export function getPostModal(editMsgID: string = '') {
    const messageIDInput = new LabelBuilder()
        .setLabel('Message ID of Post to Edit')
        .setDescription('Leave this blank when creating a new post')
        .setTextInputComponent(
            new TextInputBuilder()
                .setCustomId('messageID')
                .setPlaceholder('1234567890')
                .setValue(editMsgID)
                .setStyle(TextInputStyle.Short)
                .setMaxLength(30)
                .setRequired(false)
        )

    const postContentInput = new LabelBuilder()
        .setLabel('Text Content')
        .setTextInputComponent(
            new TextInputBuilder()
                .setCustomId('textContent')
                .setPlaceholder('Etheria was once a land of living legends...')
                .setStyle(TextInputStyle.Paragraph)
                .setMaxLength(2000)
                .setRequired(false)
        )

    const imagesInput = new LabelBuilder()
        .setLabel('Files')
        .setFileUploadComponent(
            new FileUploadBuilder()
                .setCustomId('files')
                .setMaxValues(5)
                .setRequired(false)
        )

    const pinInput = new LabelBuilder()
        .setLabel('Additional Options')
        .setStringSelectMenuComponent(
            new StringSelectMenuBuilder()
                .setCustomId('options')
                .addOptions(
                    { label: 'Pin This Post',       value: 'Pin' },
                    { label: 'Unpin This Post',     value: 'Unpin' },
                    { label: 'Remove Text Content', value: 'Remove Text' },
                    { label: 'Remove Files',        value: 'Remove Files' },
                    { label: 'Delete This Post',    value: 'Delete' },
                )
                .setRequired(false)
        )
        
    return new ModalBuilder()
        .setCustomId('postModal')
        .setTitle('Post a Message With Protobot')
        .addLabelComponents(messageIDInput, postContentInput, imagesInput, pinInput)
}