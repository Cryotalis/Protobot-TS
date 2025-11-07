import { readdirSync } from 'fs'
import path from 'path'

const EXCLUDED_DIRECTORIES = ['archive', 'attachments']

/**
 * Recursively finds all file paths that match the given extension, starting from the given directory
 * @param directory - The directory from which to start looking for files
 * @param extension - The extension to match for
 * @returns A string array of file paths
 */
export function getAllFilePaths(directory: string, extension: string) {
    const targetDirectory = path.resolve(directory)
    const targetPaths = readdirSync(targetDirectory, { withFileTypes: true })
    const targetExt = extension.startsWith('.') ? extension : `.${extension}`
    let filePaths: string[] = []

    for (const p of targetPaths) {
        const fullPath = path.join(targetDirectory, p.name)
        if (p.isDirectory() && !EXCLUDED_DIRECTORIES.includes(p.name)) {
            filePaths = filePaths.concat(getAllFilePaths(fullPath, extension))
        } else if (p.isFile() && path.extname(p.name) === targetExt) {
            filePaths.push(fullPath)
        }
    }

    return filePaths
}