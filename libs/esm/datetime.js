
// returns an array or YYYY, MM, DD - not so useful...
export function dateStrAddDay(dateStr, days = 0) {
  const d = new Date(Date.parse(dateStr) - new Date().getTimezoneOffset())
  d.setDate(d.getDate() + days) // add the days
  return [d.getFullYear().toString(), (d.getMonth() + 1).toString().padStart(2, 0), d.getDate().toString().padStart(2, 0)]
}

export const dateStrAddDayISO = (isoString, days = 0) => {
  const d = new Date(isoString)
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

// Input: Date object or ISO datetime string
// Return Format: 2023-10-24 11:40:15 GMT+8
export const getLocaleDateTimeTzISO = (dt) => {
  if (!(dt instanceof Date)) dt = new Date(dt)
  return dt.toLocaleString('sv', {
      timeZoneName: 'short',
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
  })
}

export const getLocaleDateISO = (isoString) => getLocaleDateTimeTzISO(isoString).substring(0, 10)
export const getLocaleTimeISO = (isoString) => getLocaleDateTimeTzISO(isoString).substring(11, 19)

export const dateISO = (date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().substring(0, 10)
export const timeeISO = (date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().substring(11, 19)

