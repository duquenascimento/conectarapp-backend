export class ApiRepository {
  private readonly baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private createHeaders(): Headers {
    const myHeaders = new Headers()
    myHeaders.append('secret-key', process.env.SECRET_KEY ?? '')
    myHeaders.append('external-id', process.env.EXTERNAL_ID ?? '')
    myHeaders.append('username', process.env.USERNAME ?? '')
    myHeaders.append('Content-Type', 'application/json')
    myHeaders.append('system-user-pass', process.env.SYSTEM_USER_PASS ?? '')
    myHeaders.append('Authorization', process.env.AUTH_TOKEN ?? '')
    return myHeaders
  }

  public async callApi(endpoint: string, method: string, body?: string): Promise<any> {
    try {
      const myHeaders = this.createHeaders()

      const requestOptions: RequestInit = {
        method,
        headers: myHeaders,
        body: body ?? undefined
      }

      const url = `${this.baseUrl}${endpoint}`
      const response = await fetch(url, requestOptions)

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status} - ${response.statusText}`)
      }

      const json = await response.json()
      return json
    } catch (err) {
      // if ((err as any).cause !== 'visibleError') await logRegister(err)
      throw Error((err as Error).message)
    }
  }
}
