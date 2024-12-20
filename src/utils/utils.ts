import 'dotenv/config'

export const saveFile = async (url: string, fileName: string): Promise<string | null> => {
  const urlRequest = `https://gateway.conectarhortifruti.com.br/api/v1/system/saveFile?url=${url}&fileName=${fileName}`
  const myHeaders = new Headers()
  myHeaders.append('secret-key', '9ba805b2-6c58-4adc-befc-aad30c6af23a')
  myHeaders.append('external-id', 'F0')
  myHeaders.append('username', 'contato@conectarhortifruti.com.br')
  myHeaders.append('Content-Type', 'application/json')
  myHeaders.append('system-user-pass', 'd2NuOUVVNnJWbDR5dDE5Mnl0WFdaeGo2cjRGeEtycUMydzNaWEJ5enlub0FLQmdjdEU2anBVQ2RDbWxkM2xSMQo=')
  myHeaders.append('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IkYwIiwiZW1haWwiOiJjb250YXRvQGNvbmVjdGFyaG9ydGlmcnV0aS5jb20uYnIiLCJuYW1laWQiOiIwIiwiX0V4cGlyZWQiOiIyMDI0LTA2LTIwVDAzOjQwOjM3IiwibmJmIjoxNzE3OTkwODM3LCJleHAiOjE3MTg4NTQ4MzcsImlhdCI6MTcxNzk5MDgzNywiaXNzIjoiNWRhYTY1NmNmMGNkMmRhNDk1M2U2ZTA2Njc3OTMxY2E1MTU1YzIyYWE5MTg2ZmVhYzYzMTBkNzJkMjNkNmIzZiIsImF1ZCI6ImRlN2NmZGFlNzBkMjBiODk4OWQxMzgxOTRkNDM5NGIyIn0.RBX5whQIqwtRJOnjTX622qvwCFQJxcgVXQKTyUoVFys')

  await fetch(urlRequest, {
    headers: myHeaders
  })

  return urlRequest
}

export const sendEmail = async (data: any, email: string, templateId: string): Promise<void> => {
  try {
    const body = JSON.stringify({
      personalizations: [
        {
          to: [
            {
              email
            }
          ],
          dynamic_template_data: data
        }
      ],
      from: {
        email: 'noreply@conectarapp.com.br',
        name: 'noreply'
      },
      template_id: templateId
    })
    const responsePromise = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${process.env.SENDGRID_KEY ?? ''}`
      },
      body
    })
    const response = await responsePromise.text()
    console.log(response)
  } catch (err) {
    console.error(err)
  }
}

export const generateRandomSequenceObject = (length: number = 5): Record<string, string> => {
  const sequence: Record<string, string> = {}

  for (let i = 1; i <= length; i++) {
    const randomDigit = Math.floor(Math.random() * 10)
    sequence[`c${i}`] = randomDigit.toString()
  }

  return sequence
}
