export type rarityName = 'Legendary' | 'Mythical' | 'Epic' | 'Powerful'
export interface priceData { 
    name: string
    pcPrice: string
    psPrice: string
    xboxPrice: string
    rarity: rarityName | undefined
}