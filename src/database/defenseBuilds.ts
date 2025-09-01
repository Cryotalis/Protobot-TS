import { GoogleSpreadsheetRow } from 'google-spreadsheet'
import { defenseBuilds } from './database.js'

export let defenseImages: Array<GoogleSpreadsheetRow>
export let defenseBuildData: defenseObject[] = []
export interface defenseObject {name: string, role: string, tertiary: string, shards: string[], mods: {name: string, qualibean: string}[], relic: string}

export async function loadDefenseBuilds(){
    await defenseBuilds.loadInfo()
	defenseImages = await defenseBuilds.sheetsByTitle['Data'].getRows()

	let buildData: defenseObject[] = []
	for (let i = 2; i < defenseBuilds.sheetCount-2; i++){
		let sheet = defenseBuilds.sheetsByIndex[i]
		await sheet.loadCells()

		for (let y = 2; y < sheet.rowCount; y += 20){
			if (y >= sheet.rowCount) continue
			for (let x = 1; x < sheet.columnCount; x += 5){
				if (x >= sheet.columnCount || !sheet.getCell(y + 1, x + 2).value) continue
				buildData.push({
					name: sheet.getCell(y + 1, x + 2).value?.toString() ?? '',
					role: sheet.getCell(y + 4, x + 2).value?.toString() ?? '',
					tertiary: sheet.getCell(y + 5, x + 2).value?.toString() ?? '',
					shards: [
						sheet.getCell(y + 6, x + 2).value?.toString() ?? '',
						sheet.getCell(y + 8, x + 2).value?.toString() ?? '',
						sheet.getCell(y + 10, x + 2).value?.toString() ?? ''
					],
					mods: [
						{name: sheet.getCell(y + 12, x + 2).value?.toString() ?? '', qualibean: sheet.getCell(y + 12, x + 1).formula?.match(/\d+/)?.toString() || '0'}, 
						{name: sheet.getCell(y + 14, x + 2).value?.toString() ?? '', qualibean: sheet.getCell(y + 14, x + 1).formula?.match(/\d+/)?.toString() || '0'}, 
						{name: sheet.getCell(y + 16, x + 2).value?.toString() ?? '', qualibean: sheet.getCell(y + 16, x + 1).formula?.match(/\d+/)?.toString() || '0'}
					],
					relic: sheet.getCell(y + 12, x).formula?.match(/(?<=").+(?=")/)?.toString() || ''
				})
			}
		}	
	}
	defenseBuildData = buildData
	console.log('Defense Build Data compiled')
}