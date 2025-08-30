/**
 * Takes a string containing an abbreviated number and converts it to an actual number. (Ex: 1k = 1,000)
 */
function getNumber(num: string){
    if (!/\d/.test(num)) return 0
    const number = parseFloat(num.match(/[\d.]+/)![0])
    const abbreviation = String(num.match(/k|m|b|t/i)).toLowerCase()

    switch (abbreviation) {
        case 't': return Math.round(number * 1e12)
        case 'b': return Math.round(number * 1e9)
        case 'm': return Math.round(number * 1e6)
        case 'k': return Math.round(number * 1e3)
        default : return Math.round(number)
    }
}

/**
 * Takes a number and returns it in an abbreviated form. (Ex: 1,000 = 1k)
 */
function getAbbreviatedNumber(num: number){
    if (num >= 1e12) return `${parseFloat((num /= 1e12).toFixed(2))}t`
    else if (num >= 1e9) return `${parseFloat((num /= 1e9).toFixed(2))}b`
    else if (num >= 1e6) return `${parseFloat((num /= 1e6).toFixed(2))}m`
    else if (num >= 1e3) return `${parseFloat((num /= 1e3).toFixed(2))}k`
    else return String(num)
}

/**
 * Replaces all numbers in a string with their abbreviated versions.
 */
function abbreviateAllNumbers(string: string){
    const numbers = string.match(/[\d.]+/g)
    if (!numbers) return string
    numbers.forEach(number => {
        string = string.replace(number, getAbbreviatedNumber(getNumber(number)))
    })
    return string
}