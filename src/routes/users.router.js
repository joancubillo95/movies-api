import { Router } from "express"
import { UsersController } from "../controllers/users.controller.js"
import { authenticateJWT } from "../middlewares/auth.js"
import { requireRole } from "../middlewares/roleMiddleware.js"

export const createUsersRouter = ({ usersRepository }) => {
    const usersRouter = Router()

    const usersController = new UsersController({ usersRepository })

    usersRouter.get("/", authenticateJWT, requireRole("admin"), usersController.getAll)
    usersRouter.get("/:username", usersController.getByUsername)

    return usersRouter
}