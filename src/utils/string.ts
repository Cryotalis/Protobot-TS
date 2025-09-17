import { findBestMatch } from 'string-similarity'

/**
 * Capitalizes the first letter of every word in a string
 */
export const capitalize = (string: string) => string.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')

/**
 * Capitalizes the first letter in a string
 */
export const capFirstLetter = (string: string) => string.charAt(0).toUpperCase() + string.slice(1)

/**
 * Formats an array of strings by inserting commas and replacing the last comma with ", and".
 */
export function formatList(array: string[]){
    const formattedList = array.join(', ')
    return formattedList.replace(/(.+)\,(\s*)(.+$)/, '$1$2and $3')
}

/**
 * Case insensitive version of the findBestMatch function from string-similarity
 * @param searchString the string to match each target string against
 * @param targetStrings an array of strings to be matched against the search string
 */
export function findBestCIMatch(searchString: string, targetStrings: string[]){
    // Create separate variables for lower case versions of the search string and target strings
    const LCSearchString = searchString.toLowerCase()
    const LCTargetStrings = targetStrings.map(string => string.toLowerCase())
    const matches = findBestMatch(LCSearchString, LCTargetStrings)
    matches.ratings.forEach(rating => rating.target = targetStrings.find(string => string.toLowerCase() === rating.target)!)
    return matches
}