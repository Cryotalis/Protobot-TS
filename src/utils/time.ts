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