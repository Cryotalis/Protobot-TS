import { createCanvas, loadImage } from 'canvas'
import { AttachmentBuilder } from 'discord.js'
import { CanvasTextInfo } from '../../data/canvas.js'
import { database } from '../../database/database.js'
import { defenseBuildData, defenseImages } from '../../database/defenseBuilds.js'
import { wrapText, drawCentered } from '../../utils/canvas.js'

export async function generateBuildImage(defenseName: string, defenseRole: string) {
    const { shards } = database
    const defense = defenseBuildData.find(({name, role}) => name === defenseName && role === defenseRole)!
    const canvas = createCanvas(326, 378)
    const ctx = canvas.getContext('2d')
    
    /* Draw the black background */
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, 326, 378)

    /* Draw the Defense Image */
    const defenseImageURL = defenseImages.find(def => def.get('defenseName') === defense.name)!.get('defenseURL')
    const defenseImage = await loadImage(defenseImageURL)
    ctx.drawImage(defenseImage, 0, 0, 126, 126)

    /* Draw the horizontal grey line */
    ctx.lineWidth = 4
    ctx.strokeStyle = '#434343'
    ctx.beginPath()
    ctx.moveTo(0, 124)
    ctx.lineTo(326, 125)
    ctx.stroke()

    /* Write the Defense name and role */
    wrapText({ctx: ctx, textAlign: 'center', font: '27px Arial Bold', strokeStyle: 'black', fillStyle: 'white'}, defense.name, 229, 52, 200, 27)
    drawCentered(ctx, defense.role, '18px Arial Bold', 'black', '#E06666', 229, 90)
    if (defense.tertiary) drawCentered(ctx, defense.tertiary, '16px Arial Bold', 'black', '#00FFFF', 229, 110)

    /* Draw the icons for Shard and Relic */
    const shardIcon = await loadImage('assets/Green Shard Icon.png')
    const relicIcon = await loadImage(defense.relic)
    ctx.drawImage(shardIcon, 13, 170)
    ctx.drawImage(relicIcon, 9, 293, 45, 45)

    /* Draw the Shards and Shard Icons */
    let shardDropIcon1, shardDropIcon2, shardDropIcon3
    const textStyles: CanvasTextInfo = {ctx: ctx, textAlign: 'left', font: '22px Arial Bold', strokeStyle: 'black', fillStyle: 'white'}
    if (shards.find(shard => shard.get('name') === defense.shards[0])) shardDropIcon1 = await loadImage(shards.find(shard => shard.get('name') === defense.shards[0])?.get('dropURL').toString())
    if (shards.find(shard => shard.get('name') === defense.shards[1])) shardDropIcon2 = await loadImage(shards.find(shard => shard.get('name') === defense.shards[1])?.get('dropURL').toString())
    if (shards.find(shard => shard.get('name') === defense.shards[2])) shardDropIcon3 = await loadImage(shards.find(shard => shard.get('name') === defense.shards[2])?.get('dropURL').toString())
    if (shardDropIcon1) ctx.drawImage(shardDropIcon1, 80, 132, 30, 30)
    if (shardDropIcon2) ctx.drawImage(shardDropIcon2, 80, 174, 30, 30)
    if (shardDropIcon3) ctx.drawImage(shardDropIcon3, 80, 216, 30, 30)
    if (shardDropIcon1) wrapText(textStyles, defense.shards[0], 126, 147, 200, 20)
    if (shardDropIcon2) wrapText(textStyles, defense.shards[1], 126, 189, 200, 20)
    if (shardDropIcon3) wrapText(textStyles, defense.shards[2], 126, 231, 200, 20)
    if (defense.shards[2] === 'OR') wrapText(textStyles, defense.shards[2], 126, 252, 200, 20)

    /* Draw the Mods and Qualibean Icons */
    let qualibean1, qualibean2, qualibean3
    const qualibeans = defenseImages.map(row => row.get('modURL'))
    if (defense.mods[0].qualibean) qualibean1 = await loadImage(qualibeans[parseInt(defense.mods[0].qualibean)-1])
    if (defense.mods[1].qualibean) qualibean2 = await loadImage(qualibeans[parseInt(defense.mods[1].qualibean)-1])
    if (defense.mods[2].qualibean) qualibean3 = await loadImage(qualibeans[parseInt(defense.mods[2].qualibean)-1])
    if (qualibean1 && defense.mods[0].qualibean) ctx.drawImage(qualibean1, 82, 254, 25, 37)
    if (qualibean2 && defense.mods[1].qualibean) ctx.drawImage(qualibean2, 82, 297, 25, 37)
    if (qualibean3 && defense.mods[2].qualibean) ctx.drawImage(qualibean3, 82, 339, 25, 37)
    if (defense.mods[0].name) wrapText(textStyles, defense.mods[0].name, 126, 273, 200, 20)
    if (defense.mods[1].name) wrapText(textStyles, defense.mods[1].name, 126, 315, 200, 20)
    if (defense.mods[2].name) wrapText(textStyles, defense.mods[2].name, 126, 357, 200, 20)

    return new AttachmentBuilder(canvas.toBuffer('image/png'), {name: `${defense.name}.png`})
}