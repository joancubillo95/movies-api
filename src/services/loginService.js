import { JWT_REFRESH, JWT_SECRET } from "../config/env.js"

import { AppError } from "../utils/appError.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const DUMMY_PASSWORD_HASH = bcrypt.hashSync(
    crypto.randomBytes(32).toString("hex"),
    10
)

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
            const passHash = user?.password_hash ?? DUMMY_PASSWORD_HASH
            const passMatch = await this.validatePassword(pass, passHash)
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

    generateToken = (user) => {
        return jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: "30m" }
        );
    }

    generateRefreshToken = (user) => {
        return jwt.sign(
            {
                id: user.id
            },
            JWT_REFRESH,
            { expiresIn: "24h" }
        );
    }

    refreshLogin = async (refreshToken) => {
        let payload
        try {
            payload = jwt.verify(refreshToken, JWT_REFRESH)
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


