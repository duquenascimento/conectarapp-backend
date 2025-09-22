import { decode } from 'jsonwebtoken'

export function isTestRestaurant(externalId: string): boolean {
  const testRestaurants = ['C757', 'C939', 'C940', 'C941']

  return testRestaurants.includes(externalId)
}

export function isTestRestaurant2(token: string): boolean {
  const isTest = decode(token) as { position: string } | null

  console.log('Decoded: ', isTest)

  return isTest?.position === 'teste'
}
