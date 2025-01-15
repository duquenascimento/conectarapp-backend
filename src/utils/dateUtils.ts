export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
  )
}

export const isTimeWithinMinutes = (orderHour: Date, comparisonTime: Date, minutes: number): boolean => {
  const toMinutes = (time: Date): number => time.getHours() * 60 + time.getMinutes()

  const orderMinutes = toMinutes(new Date(orderHour))
  const comparisonMinutes = toMinutes(new Date(comparisonTime))

  return orderMinutes <= comparisonMinutes + minutes
}
