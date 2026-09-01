import { LoginController } from "../controllers/login.controller.js";
import { LoginService } from "../services/loginService.js";
import { Router } from "express";

export const createLoginRouter = ({ usersRepository }) => {

    const loginRouter = Router()
    const loginService = new LoginService(usersRepository)
    const loginController = new LoginController({ loginService })

    loginRouter.post("/login", loginController.login)

    return loginRouter
}