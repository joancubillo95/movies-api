import { Router } from "express"
import { UsersController } from "../controllers/users.controller.js"

export const createUsersRouter = ({ usersRepository }) => {
    const usersRouter = Router()

    const usersController = new UsersController({ usersRepository })

    usersRouter.get("/", usersController.getAll)
    usersRouter.get("/:username", usersController.getByUsername)

    return usersRouter
}