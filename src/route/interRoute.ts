import { type FastifyInstance } from 'fastify'
import { WebhookBolecodeResponse, webhookInterHandler } from '../service/interService'

export const interRoute = async (server: FastifyInstance): Promise<void> => {
    server.post('/inter/webhook', async (req, res): Promise<any> => {
        try {
            webhookInterHandler(req.body as WebhookBolecodeResponse[])
            return await res.status(200).send()
        } catch (err) {
            const message = (err as Error).message
            if (message === process.env.INTERNAL_ERROR_MSG) {
                await res.status(500).send({
                    status: 500,
                    msg: message
                })
            } else {
                await res.status(400).send({
                    status: 400,
                    msg: message
                })
            }
        }
    })
}
