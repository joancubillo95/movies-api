import { AppError } from "../utils/appError.js"

export class LoginController {
    constructor({ loginService }) {
        this.loginService = loginService
    }

    login = async (req, res) => {

        const { username, password } = req.body
        const { token, refreshToken, user } = await this.loginService.validateLogin(username, password)
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/api/v1/auth"
        })
        res.json({ token, user })
    }

    refreshLogin = async (req, res) => {
        try {
            const { refreshToken } = req.cookies

            if (!refreshToken) {
                throw new AppError("Refresh token required", 401)
            }

            const { token, user } = await this.loginService.refreshLogin(refreshToken)

            res.json({ token, user })
        } catch (error) {
            throw new AppError("Unexpected error trying to refresh token", 500, error)
        }
    }
}