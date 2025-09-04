export function compareVersions(currentVersion: string, minimumVersion: string): boolean {
  const currentParts = currentVersion.split('.').map(Number)
  const minimumParts = minimumVersion.split('.').map(Number)
  const length = Math.max(currentParts.length, minimumParts.length)

  for (let i = 0; i < length; i++) {
    const currentPart = currentParts[i] ?? 0
    const minimumPart = minimumParts[i] ?? 0

    if (currentPart < minimumPart) return true
    if (currentPart > minimumPart) return false
  }

  return false
}
