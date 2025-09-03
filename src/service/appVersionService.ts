import { createAppVersion, findAppVersionByExternalId, updateAppVersion } from '../repository/appVersionRepository'
import { compareVersions } from '../utils/VersionCompare'

export const registerAppVersionService = async (data: { externalId: string; version: string; statusId: number; OperationalSystem: string }) => {
  const existing = await findAppVersionByExternalId(data.externalId)
  if (existing) {
    return await updateAppVersion(data)
  }
  return await createAppVersion(data)
}

export const checkAppVersionService = async (data: { externalId: string }) => {
  const userAppVersion = await findAppVersionByExternalId(data.externalId)

  if (!userAppVersion) {
    throw new Error(`Nenhuma versão encontrada para externalId ${data.externalId}`)
  }

  const currentVersion = userAppVersion.version
  const minimumVersion = process.env.MIN_APP_VERSION ?? '1.0.0'
  const mustUpdate = compareVersions(currentVersion, minimumVersion)
  const message = mustUpdate ? 'Uma nova versão está disponível. Atualize para continuar!' : 'A versão está atualizada'

  return {
    updateRequired: mustUpdate,
    message,
    currentVersion,
    minimumVersion
  }
}
