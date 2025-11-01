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

export const DFKIcon = new AttachmentBuilder('./assets/attachments/Drakenfrost_DD_Logo.png', {
    name: 'Drakenfrost_DD_Logo.png'
})

export const DFKRotationImages = [
    new AttachmentBuilder('./assets/attachments/Torchbearer_Week.png' ,       { name: 'Torchbearer_Week.png'  }),
    new AttachmentBuilder('./assets/attachments/Frozen_Path_Week.png',        { name: 'Frozen_Path_Week.png' }),
    new AttachmentBuilder('./assets/attachments/Frostfire_Remnants_Week.png', { name: 'Frostfire_Remnants_Week.png' }),
    new AttachmentBuilder('./assets/attachments/Drakenlords_Soul_Week.png',   { name: 'Drakenlords_Soul_Week.png' }),
]