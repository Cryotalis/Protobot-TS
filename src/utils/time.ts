import { MILLISECONDS } from '../data/time.js'

/**
 * Returns the difference between 2 dates in days, hours, minutes, and seconds.
 */
export function dateDiff(firstDate: Date, secondDate: Date) {
    let timeDiff = Math.abs(secondDate.getTime() - firstDate.getTime())
    const days = Math.floor(timeDiff / MILLISECONDS.DAY)
    timeDiff -= days * MILLISECONDS.DAY
    const hours = Math.floor(timeDiff / MILLISECONDS.HOUR)
    timeDiff -= hours * MILLISECONDS.HOUR
    const minutes = Math.floor(timeDiff / MILLISECONDS.MINUTE)
    timeDiff -= minutes * MILLISECONDS.MINUTE
    const seconds = Math.floor(timeDiff / MILLISECONDS.SECOND)

    return { days, hours, minutes, seconds }
}