import { AttachmentBuilder } from 'discord.js'

export const rumbleIcon = new AttachmentBuilder('./assets/attachments/Elemental_Rumble_Icon.png', {
    name: 'Elemental_Rumble_Icon.png'
})

export const rumbleRotationImages = [
    new AttachmentBuilder('./assets/attachments/Fire_Week_Items.png' , { name: 'Fire_Week_Items.png'  }),
    new AttachmentBuilder('./assets/attachments/Water_Week_Items.png', { name: 'Water_Week_Items.png' }),
    new AttachmentBuilder('./assets/attachments/Storm_Week_Items.png', { name: 'Storm_Week_Items.png' }),
    new AttachmentBuilder('./assets/attachments/Earth_Week_Items.png', { name: 'Earth_Week_Items.png' }),
]