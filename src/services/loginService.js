import { ACCESS_TOKEN, REFRESH_TOKEN, signToken, verifyToken } from "../utils/jwtHelper.js"
import { JWT_REFRESH, JWT_SECRET } from "../config/env.js"

import { AppError } from "../utils/appError.js"
import bcrypt from "bcrypt"

export class LoginService {
    constructor(usersRepository) {
        this.usersRepository = usersRepository
    }

    validatePassword = async (pass, password_hash) => {
        return await bcrypt.compare(pass, password_hash)
    }

    validateLogin = async (username, pass) => {
        try {
            const user = await this.usersRepository.login({ username })
            const passHash = user?.password_hash
            const passMatch = passHash ? await this.validatePassword(pass, passHash) : false
            if (!user || !passMatch) {
                throw new Error("Invalid login attempt")
            }

            const token = this.generateToken(user)
            const refreshToken = this.generateRefreshToken(user)
            return { token, refreshToken, user: { id: user.id, username: user.username, role: user.role } }
        } catch (error) {
            throw new AppError("Invalid login attempt", 401, error)
        }
    }

    generateToken = ({ id, username, role }) => signToken({
        payload: {
            id,
            username,
            role
        },
        secret: JWT_SECRET,
        type: ACCESS_TOKEN,
        expiresIn: "30m"
    })

    generateRefreshToken = ({ id }) => signToken({
        payload: {
            id
        },
        secret: JWT_REFRESH,
        type: REFRESH_TOKEN,
        expiresIn: "24h"
    })

    refreshLogin = async (refreshToken) => {
        let payload
        try {
            payload = verifyToken({
                token: refreshToken,
                secret: JWT_REFRESH,
                expectedType: REFRESH_TOKEN
            })
        } catch (error) {
            throw new AppError("Invalid refresh token", 401, error)
        }
        const user = await this.usersRepository.getById({ id: payload.id })
        if (!user) {
            throw new AppError("Invalid refresh token", 401)
        }
        return { token: this.generateToken(user), user }
    }
}
