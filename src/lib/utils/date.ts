/**
 * Returns the current year-month in "YYYY-MM" format.
 */
export function getCurrentYearMonth(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    return `${year}-${month}`
}

/**
 * Returns the next year-month in "YYYY-MM" format.
 */
export function getNextYearMonth(): string {
    const now = new Date()
    let year = now.getFullYear()
    let month = now.getMonth() + 2 // +1 for next month, +1 for 0-indexed month

    if (month > 12) {
        month = 1
        year++
    }

    return `${year}-${String(month).padStart(2, '0')}`
}

/**
 * Returns the first day of the next month.
 */
export function getNextMonthFirstDay(yearMonth: string): Date {
    const [year, month] = yearMonth.split('-').map(Number)

    let nextMonth = month + 1
    let nextYear = year

    if (nextMonth > 12) {
        nextMonth = 1
        nextYear++
    }

    return new Date(Date.UTC(nextYear, nextMonth - 1, 1, 0, 0, 0))
}
