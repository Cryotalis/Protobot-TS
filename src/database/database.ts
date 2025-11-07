import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'

import { PublicDatabaseSchema, publicDatabaseConfig } from './publicTypes.js'
import { PrivateDatabaseSchema, privateDatabaseConfig } from './privateTypes.js'

type DatabaseSchema = PublicDatabaseSchema & PrivateDatabaseSchema
export const database = {} as DatabaseSchema

const serviceAccountAuth = new JWT({
	email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
	key: process.env.GOOGLE_PRIVATE_KEY,
	scopes: ['https://www.googleapis.com/auth/spreadsheets']
})

const publicDB = new GoogleSpreadsheet('1yOjZhkn9z8dJ8HMD0YSUl7Ijgd9o1KJ62Ecf4SgyTdU', serviceAccountAuth)
const privateDB = new GoogleSpreadsheet(process.env.PRIVATE_DB_ID!, serviceAccountAuth)
export const defenseBuildsDB = new GoogleSpreadsheet('1sjBA60Fr9ryVnw4FUIMU2AVXbKw395Tdz7j--EAUA1A', serviceAccountAuth)

export async function connectDatabase() {
    await Promise.all([
        loadDatabase(publicDB, publicDatabaseConfig),
        loadDatabase(privateDB, privateDatabaseConfig)
    ])

    console.log('Database connection successful')
}

type DatabaseConfig = { [key: string]: { name: string, type: any } }
async function loadDatabase<C extends DatabaseConfig>(
    sheetDB: GoogleSpreadsheet, sheetConfig: C
) : Promise<void> {
    try {
        await sheetDB.loadInfo()

        type keyType = keyof typeof sheetConfig
        const tableKeys = Object.keys(sheetConfig) as Array<keyType>

        const tablePromises = tableKeys.map(async key => {
            const tableName = sheetConfig[key].name
            const table = sheetDB.sheetsByTitle[tableName]
            if (!table) throw new Error(`Table "${tableName}" not found.`)
            
            return {
                key,
                table,
                data: await table.getRows() as Array<typeof sheetConfig[keyType]['type']>
            }
        })

        const tablesInfo = await Promise.all(tablePromises)

        tablesInfo.forEach(({key, table, data}) => {
            type TableKey = keyof DatabaseSchema & `${string & keyType}Table`
            const tableKey = `${String(key)}Table` as TableKey

            ;(database as Record<TableKey, GoogleSpreadsheetWorksheet>)[tableKey] = table
            ;(database as { [K in keyType]: Array<typeof sheetConfig[keyType]['type']> })[key] = data
        })
    } catch (error) {
        console.error('Failed to load database:', error)
        throw error
    }
}