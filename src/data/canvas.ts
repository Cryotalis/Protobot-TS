import { CanvasRenderingContext2D, CanvasTextAlign, CanvasGradient, CanvasPattern } from 'canvas'

export interface CanvasTextInfo {
    ctx: CanvasRenderingContext2D,
    font: string,
    textAlign: CanvasTextAlign,
    strokeStyle: string | CanvasGradient | CanvasPattern,
    fillStyle: string | CanvasGradient | CanvasPattern
}