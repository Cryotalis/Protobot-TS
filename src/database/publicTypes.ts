import { GoogleSpreadsheetRow, GoogleSpreadsheetWorksheet } from 'google-spreadsheet'

type ModKeys = 'name' | 'description' | 'drop' | 'hero' | 'type' | 'image'
type ModInfo = { [K in ModKeys]: string }

type ShardKeys = ModKeys | 'upgradeLevels' | 'dropURL' | 'gilded'
type ShardInfo = { [K in ShardKeys]: string }

export type rarityName = 'Legendary' | 'Mythical' | 'Epic' | 'Powerful'
type PriceKeys = 'name' | 'pcPrice' | 'psPrice' | 'xboxPrice'
export type PriceInfo = { 
    [K in PriceKeys]: string
} & {
    rarity: rarityName | undefined
}

type LinkKeys = 'author' | 'name' | 'description' | 'link'
type LinkInfo = { [K in LinkKeys]: string }

// Tag should be changed to username at some point (because that's what it really is now)
type ContributorKeys = 'img' | 'name' | 'tag' | 'id' | 'description' | 'roles' | 'imageURL'
type ContributorInfo = { [K in ContributorKeys]: string }

type GenericKeys = 'name' | 'value'
type GenericInfo = { [K in GenericKeys]: string }

// Name must match the table name from the Google Sheet
export const publicDatabaseConfig = {
    shards: { name: 'Shards', type: {} as ShardInfo },
    mods: { name: 'Mods', type: {} as ModInfo },
    prices: { name: 'Prices', type: {} as PriceInfo },
    links: { name: 'Links', type: {} as LinkInfo },
    images: { name: 'Images', type: {} as GenericInfo },
    faq: { name: 'FAQ', type: {} as GenericInfo },
    contributors: { name: 'Contributors', type: {} as ContributorInfo },
} as const

type dbConfigKey = keyof typeof publicDatabaseConfig
export type PublicDatabaseSchema = {
    [K in dbConfigKey as `${K}Table`]: GoogleSpreadsheetWorksheet
} & {
    [K in dbConfigKey]: Array<GoogleSpreadsheetRow<typeof publicDatabaseConfig[K]['type']>>
}