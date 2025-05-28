import { createAppVersion, findAppVersionByExternalId, updateAppVersion } from '../repository/appVersionRepository'

export const registerAppVersionService = async (data: {
  externalId: string
  version: string
  statusId: number
  OperationalSystem: string
}) => {
  const existing = await findAppVersionByExternalId(data.externalId)
  if (existing) {
    // Atualiza a versão
    return await updateAppVersion(data)
  }
  return await createAppVersion(data)
}
