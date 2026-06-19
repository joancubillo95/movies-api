import { Router } from 'express'
import { HealthController } from '../controllers/health.controller.js'

export const createHealthRouter = () => {
    const healthRouter = Router()

    const healthController = new HealthController()

    healthRouter.get('/', healthController.healthCheck)

    return healthRouter
}
