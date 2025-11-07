import { defenseBuildsDB } from './database.js'

export interface defenseObject {
	name: string,
	role: string,
	tertiary: string | null,
	shards: (string | null)[],
	mods: { name: string | null, qualibean: number | null }[],
	relic: 'medallion' | 'totem'
}

export let defenseBuildData: defenseObject[] = []

export async function loadDefenseBuilds() {
    await defenseBuildsDB.loadInfo()

	const buildData: defenseObject[] = []
	for (let i = 2; i < defenseBuildsDB.sheetCount - 2; i++) { // First and last two tabs do not contain defense build data
		let sheet = defenseBuildsDB.sheetsByIndex[i]
		await sheet.loadCells()

		for (let y = 2; y < sheet.rowCount; y += 20) {
			for (let x = 1; x < sheet.columnCount; x += 5) {
				const defenseName = sheet.getCell(y + 1, x + 2).value?.toString()
				let   defenseRole = sheet.getCell(y + 4, x + 2).value?.toString()
				if (!defenseName || !defenseRole) continue

				const duplicateDefense = buildData.findLast(d => d.name === defenseName && String(d.role.match(/[\w\s]+/)).trim() === defenseRole)
				if (duplicateDefense) {
					const variant: RegExpMatchArray | null = duplicateDefense.role.match(/\((\w)\)$/)
					if (variant) {
						const newVariant = String.fromCharCode(variant[1].toLowerCase().charCodeAt(0) + 1)
						defenseRole += ` (${newVariant})`
					} else {
						duplicateDefense.role += ' (a)'
						defenseRole += ' (b)'
					}
				}

				buildData.push({
					name: defenseName,
					role: defenseRole,
					tertiary: sheet.getCell(y + 5, x + 2).value?.toString() ?? null,
					shards: [6, 8, 10].map(yOffset => sheet.getCell(y + yOffset, x + 2).value?.toString() ?? null),
					mods: [12, 14, 16].map(yOffset => {
						const qualibeanInfo = sheet.getCell(y + yOffset, x + 1).formula
						return ({
							name: sheet.getCell(y + yOffset, x + 2).value?.toString() ?? null,
							qualibean: qualibeanInfo ? parseInt(qualibeanInfo.match(/\d+/)![0]) : null
						})
					}),
					relic: sheet.getCell(y + 12, x).formula?.startsWith('totem') ? 'totem' : 'medallion'
				})
			}
		}	
	}

	defenseBuildData = buildData
	console.log('Defense Build Data compiled')
}