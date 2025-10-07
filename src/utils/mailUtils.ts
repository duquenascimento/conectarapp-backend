import sgMail from '@sendgrid/mail'
import path from 'path'
import { readFileSync } from 'fs'
import { confirmOrderEmail } from '../types/confirmTypes'

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

export const sendHTMLEmail = async (
  confirmOrderData: confirmOrderEmail,
  code: string
): Promise<any> => {
  const { userName, userEmail, subject } = confirmOrderData // Desestruturação do objeto recebido
  const emailTemplatePath = path.join(__dirname, '..', 'templates', 'emailTemplate.html') // Caminho até o template do email
  let htmlFile = readFileSync(emailTemplatePath, 'utf-8') // Leitura do arquivo HTML

  htmlFile = htmlFile.replace('{{NOME_DO_USUARIO}}', userName) // Redefine a variável 'NOME_DO_USUÁRIO' para o nome recebido pela função
  htmlFile = htmlFile.replace('{{H1_EMAIL}}', subject) // Redefine a variável '{{H1_EMAIL}}' para o assunto recebido pela função
  htmlFile = htmlFile.replace('{{CODIGO}}', code) // Redefine a variável '{{CODIGO}}' para o código recebido pela função

  const msg = {
    to: userEmail,
    from: {
      email: 'no-reply@conectarhortifruti.com.br',
      name: 'noreply'
    },
    subject: subject,
    html: htmlFile,
    text: `${userName}, seu código está aqui!`
  }
  try {
    await sgMail.send(msg);
  } catch (err: any) {
    console.error('Falha ao enviar o email:', err)
    if (err.response) 
      console.error(err.response.body)
  }
}
