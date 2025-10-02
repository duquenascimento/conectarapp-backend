import { decode } from 'jsonwebtoken'

export function isTestRestaurant(token: string): boolean {
  const isTest = decode(token) as { position: string } | null

  return isTest?.position === 'teste'
}
