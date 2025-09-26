import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_KEY ?? '')

export const sendEmail = async (
  data: any,
  email: string,
  templateId: string
): Promise<void> => {
  const msg = {
    to: email,
    from: {
      email: 'no-reply@conectarhortifruti.com.br',
      name: 'noreply'
    },
    templateId,
    dynamic_template_data: data
  }
  try {
    await sgMail.send(msg)
  } catch (err: any) {
    console.error('Falha ao enviar o email:', err)
    if (err.response) {
      console.error(err.response.body)
    }
  }
}
