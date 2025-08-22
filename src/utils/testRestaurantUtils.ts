export function isTestRestaurant(externalId: string): boolean {
  const testRestaurants = ['C757', 'C939', 'C940', 'C941']

  return testRestaurants.includes(externalId)
}
