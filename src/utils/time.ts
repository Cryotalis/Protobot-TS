import { timeZoneOffsets } from '../data/time.js'

export const TZdefault = timeZoneOffsets.find(TZ => TZ.name === 'EST')!

/**
 * Returns a time zone offset object with time zone name and offset. Defaults to UTC+0 if input is invalid.
 */
export function findTimeZone(timeZone: string) {
    return timeZoneOffsets.find(TZ => TZ.name === timeZone.toUpperCase()) || TZdefault
}

/**
 * Converts UTC offset in format ±hours:minutes to minutes
 * @param {String} offset - The UTC offset in format ±hours:minutes 
 */
export function parseOffset(offset: string) {
    const hours = parseInt(offset.match(/-?\d+/)![0])
    const minutes = /:\d+/.test(offset) ? parseInt(offset.match(/(?<=:)\d+/)![0]) : 0
    return hours * 60 + minutes
}

/**
 * Returns the difference between 2 dates in days, hours, minutes, and seconds.
 */
export function dateDiff(firstDate: Date, secondDate: Date) {
    let timeDiff = Math.abs(secondDate.getTime() - firstDate.getTime()) / 1000
    const days = Math.floor(timeDiff / 86400)
    timeDiff -= days * 86400
    const hours = Math.floor(timeDiff / 3600)
    timeDiff -= hours * 3600
    const minutes = Math.floor(timeDiff / 60)
    timeDiff -= minutes * 60
    const seconds = Math.floor(timeDiff)

    return { days, hours, minutes, seconds }
}

/**
 * Converts time duration input to unix. Format: a days b hours c minutes d seconds.
 */
export function timeToUnix(time: string) { //Converts a day/hour/minute/second time input to unix
    const years = /\d+\s?y/i.test(time) ? parseInt(time.match(/\d+\s?y/i)![0]) : (/\sy/i.test(time) || /^y/i.test(time)) ? 1 : 0
    const months = /\d+\s?mo/i.test(time) ? parseInt(time.match(/\d+\s?mo/i)![0]) : (/\smo/i.test(time) || /^mo/i.test(time)) ? 1 : 0
    const weeks = /\d+\s?w/i.test(time) ? parseInt(time.match(/\d+\s?w/i)![0]) : (/\sw/i.test(time) || /^w/i.test(time)) ? 1 : 0
    const days = /\d+\s?d/i.test(time) ? parseInt(time.match(/\d+\s?d/i)![0]) : (/\sd/i.test(time) || /^d/i.test(time)) ? 1 : 0
    const hours = /\d+\s?h/i.test(time) ? parseInt(time.match(/\d+\s?h/i)![0]) : (/\sh/i.test(time) || /^h/i.test(time)) ? 1 : 0
    const minutes = /\d+\s?min/i.test(time) ? parseInt(time.match(/\d+\s?min/i)![0]) : (/\smin/i.test(time) || /^min/i.test(time)) ? 1 : 0
    const seconds = /\d+\s?s/i.test(time) ? parseInt(time.match(/\d+\s?s/i)![0]) : (/\ss/i.test(time) || /^s/i.test(time)) ? 1 : 0
    return years * 3.156e+10 + months * 2.628e+9 + weeks * 6.048e+8 + days * 8.64e+7 + hours * 3.6e+6 + minutes * 6e+4 + seconds * 1e+3
}

/**
 * Converts date/time input to unix. Format: 1:23 AM/PM TimeZone
 */
export function dateStringToUnix(dateString: string) {
    dateString = dateString.toLowerCase().replace(/[^a-zA-Z0-9\s\/:]/g, '') //Remove any characters that aren't words/numbers/spaces/slashes
    const now = new Date()
    const year = now.getFullYear().toString()
    const months = [ 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec' ]
    const month = months.find(m => dateString.toLowerCase().includes(m))
    const timeFormat = new RegExp(/(\d+\s*:\s*\d+\s*:?\s*\d*\s*(AM|PM)?)|(\d+\s*(AM|PM))/i)
    const abbreviated = new RegExp('(\\d\\d?)\\s*/\\s*(\\d\\d?)\\s*/?\\s*(\\d*)') // 1/1/1970
    const american = new RegExp(`(${month}\\w*)\\s+(\\d+)(?:\\w*)\\s*(\\d*)`) // January 1, 1970
    const british = new RegExp(`(\\d+)(?:\\w*)\\s*(${month}\\w*)\\s*(\\d*)`) // 1 January, 1970
    const mdyTimeZones = [
        'SST',  'PDT',  'PST',  'PT',
        'NDT',  'NST',  'ADT',  'AST',
        'AT',   'EST',  'EDT',  'ET',
        'CST',  'CDT',  'CT',   'MST',
        'MDT',  'MT',   'CHUT', 'PONT',
        'KOST', 'CHST', 'JST',  'KST',
        'MHT',  'PHT',  'AOE',  'WAKT',
        'HST',  'AKDT'
    ] // Timezones that use the Month/Day/Year format
    let date = '', time = dateString.match(timeFormat)![0], timeZone = TZdefault.name

    if (time) { //Extracts the time, if it was provided
        dateString = dateString.replace(timeFormat, '').trim() //Remove the time from dateString
        if (time.match(/\d+/)![0] !== '12' && /pm/i.test(time)) {time = time.replace(/\d+/, String(parseInt(time.match(/\d+/)![0]) + 12))} //Convert the time input to military time
        time = time.replace(/\s*(am|pm)/i, '') //Remove AM or PM from the time input   
        while (!/.+:.+:.+/.test(time)) {time += ':00'} //Coerce time input to format hh:mm:ss (hours, minutes, and seconds)
    }

    let dateData: RegExpMatchArray = ['']
    function getDateData(format: RegExp){
        if (dateString.replace(format, '').trim()) {timeZone = dateString.replace(format, '').trim().split(' ').at(-1)!} //Note the time zone if it was provided
        dateData = dateString.match(format)!
        if (!dateData[3]) {dateData[3] = year}
    }

    if (abbreviated.test(dateString)) { //Abbreviated date format
        getDateData(abbreviated)
        if (mdyTimeZones.some(tz => tz === timeZone)) {
            date = `${dateData[1]}/${dateData[2]}/${dateData[3]}`
        } else {
            date = `${dateData[2]}/${dateData[1]}/${dateData[3]}`
        }
    } else if (american.test(dateString)) { //American date format
        getDateData(american)
        date = `${dateData[1]} ${dateData[2]} ${dateData[3]}`
    } else if (british.test(dateString)) { //British date format
        getDateData(british)
        date = `${dateData[2]} ${dateData[1]} ${dateData[3]}`
    } else if (time) { //If a date wasn't specified, use today's date
        if (dateString) {timeZone = dateString.trim().split(' ').at(-1)!}
        const timeZoneOffset = findTimeZone(timeZone).offset
        now.setHours(new Date().getHours() + parseInt(timeZoneOffset.match(/-?\d+/)![0]))
        date = `${now.getMonth() + 1}/${now.getDate()}/${year}`
    } else {
        return null
    }

    const timeZoneOffset = findTimeZone(timeZone).offset
    return isNaN(Date.parse(`${date} ${time} ${timeZoneOffset}`)) ? Date.parse(`${date} ${time}`) : Date.parse(`${date} ${time} ${timeZoneOffset}`)
}

/**
 * Converts a Date object to a more readable format - [Thu Jan 1 1970 00:00:00 AM]
 * @param {Boolean} showTZ - Whether or not the time zone should be displayed
 */
export function dateToString(date: Date, timeZone: string = 'UTC', showTZ: boolean = false) {
    date.setMinutes(date.getMinutes() + new Date().getTimezoneOffset()) //Ensures that the function uses UTC rather than the system timezone. Unecessary in if host uses UTC.
    date.setMinutes(date.getMinutes() + parseOffset(findTimeZone(timeZone).offset)) //Add the offset from UTC to the date
    let dateString = String(date).replace(/\sGMT.\d{4}\s\(.+\)/, '') //Removes the timezone offset in GMT from the date string
    const hours = parseInt(dateString.match(/\d\d:/)![0])
    const ampm = hours < 12 ? 'AM' : 'PM'

    if (hours > 12) {dateString = dateString.replace(`${hours}:`, `${hours - 12}:`)} //Coerce the output to 12 hour format
    if (hours === 0) {dateString = dateString.replace(`${hours}:`, `${hours + 12}:`)} //Coerce the output to 12 hour format
    if (!showTZ) {timeZone = ''}
    return `${dateString} ${ampm} ${timeZone.toUpperCase()}`.trim()
}