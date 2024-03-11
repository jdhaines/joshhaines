/* Add a provided number of days to a date string.  Return a date string */

export function dateAddDays(dateString: string, days: number): string {
  const date = new Date(dateString)
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}
