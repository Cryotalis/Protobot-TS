import { CanvasRenderingContext2D } from 'canvas'
import { CanvasTextInfo } from '../data/canvas.js'

/**
 * Writes text that wraps around when it reaches a horizontal limit
 * @param textInfo - Object containing styling information for the text
 * @param text - The text to be written
 * @param textX - The X coordinate of the text
 * @param textY - The Y coordinate of the text
 * @param maxWidth - The width of the line of text. After reaching this width limit the text will wrap around
 * @param lineHeight - The spacing between lines of text
 */
export function wrapText(textInfo: CanvasTextInfo, text: string, textX: number, textY: number, maxWidth: number, lineHeight: number) {
    const {ctx} = textInfo
    ctx.font = textInfo.font
    ctx.textAlign = textInfo.textAlign
    ctx.strokeStyle = textInfo.strokeStyle
    ctx.lineWidth = 3
    ctx.fillStyle = textInfo.fillStyle
    ctx.textBaseline = 'middle'
    const words = text.split(' ')
    let line = ''
    
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' '
        const metrics = ctx.measureText(testLine)
        const testWidth = metrics.width
        if (testWidth > maxWidth && n > 0) {
            textY -= (ctx.measureText(text).actualBoundingBoxAscent + ctx.measureText(text).actualBoundingBoxDescent) / 2
            ctx.strokeText(line, textX, textY)
            ctx.fillText(line, textX, textY)
            line = words[n] + ' '
            textY += lineHeight
        } else {
            line = testLine
        }
    }
    ctx.strokeText(line, textX, textY)
    ctx.fillText(line, textX, textY)
}

/**
 * Draws centered text
 * @param ctx - The Canvas API
 * @param text - The text to be written
 * @param font - The font of the text
 * @param outline - The color for the outline of the text
 * @param color - The color of the text
 * @param x - The x coordinate of the text
 * @param y - The y coordinate of the text
 */
export function drawCentered(ctx: CanvasRenderingContext2D, text: string, font: string, outline: string, color: string, x: number, y: number) {
    ctx.font = font
    ctx.textAlign = 'center'
    ctx.strokeStyle = outline
    ctx.lineWidth = 3
    ctx.strokeText(text, x, y)
    ctx.fillStyle = color
    ctx.fillText(text, x, y)
}