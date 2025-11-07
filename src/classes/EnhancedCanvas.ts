import { Canvas, CanvasRenderingContext2D } from 'canvas'

/**
 * Customized version of Canvas with custom helper methods for drawing
 */
export class EnhancedCanvas extends Canvas {
    public ctx: CanvasRenderingContext2D

    constructor(width: number, height: number, type?: 'pdf'|'svg') {
        super(width, height, type)
        this.ctx = this.getContext('2d')
    }

    /**
     * Writes text that wraps around when it reaches a horizontal limit
     * 
     * This is a customized version of the wrapText method from https://stackoverflow.com/questions/23201411/canvas-wraptext-function-with-filltext
     * @param text - The text to be written
     * @param x - The X coordinate of the text
     * @param y - The Y coordinate of the text
     * @param maxWidth - The width of the line of text. After reaching this width limit the text will wrap around
     * @param lineHeight - The spacing between lines of text (generally, this should be the same number as the font size)
     */
    wrapText(text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
        const ctx = this.ctx
        const words = text.split(' ')
        let line = ''
        
        ctx.save()
        ctx.textBaseline = 'middle'
        
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' '
            const metrics = ctx.measureText(testLine)
            const testWidth = metrics.width
            if (testWidth > maxWidth && n > 0) {
                y -= (ctx.measureText(text).actualBoundingBoxAscent + ctx.measureText(text).actualBoundingBoxDescent) / 2
                ctx.fillText(line, x, y)
                line = words[n] + ' '
                y += lineHeight
            } else {
                line = testLine
            }
        }

        ctx.fillText(line, x, y)
        ctx.restore()
    }
}