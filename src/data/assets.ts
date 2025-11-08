import { loadImage } from 'canvas'
import { AttachmentBuilder } from 'discord.js'
import { getAllFilePaths } from '../utils/filesystem.js'
import path from 'path'

const pngFilePaths = getAllFilePaths('./assets', 'png')

const attachmentFilePaths = pngFilePaths.filter(f => /Misc_Icons|Infographics|Shard_Icons/.test(f))
const imageFilePaths = pngFilePaths.filter(f => /Misc_Icons|Defense_Icons|Difficulty_Icons/.test(f))

const imagePromises = imageFilePaths.map(f => loadImage(f))
const resolvedImages = await Promise.all(imagePromises)

export const attachments = Object.fromEntries(
    attachmentFilePaths.map(filePath => {
        const fileName = path.basename(filePath)
        return [fileName, new AttachmentBuilder(filePath, { name: fileName })]
    })
)

export const images = Object.fromEntries(
    imageFilePaths.map((filePath, index) => [path.basename(filePath), resolvedImages[index]])
)
