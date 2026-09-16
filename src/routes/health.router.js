import { HealthController } from '../controllers/health.controller.js'
import { Router } from 'express'

export const createHealthRouter = () => {
    const healthRouter = Router()

    const healthController = new HealthController()

    /**
     * @swagger
     * /:
     *   get:
     *     summary: Retrieve health status for api
     *     responses:
     *       200:
     *         description: API Status
     */
    healthRouter.get('/', healthController.healthCheck)

    return healthRouter
}
