import { AppError } from "../utils/appError.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export class LoginService {

    constructor(usersRepository) {
        this.usersRepository = usersRepository
    }

    validatePassword = async (pass, password_hash) => {
        return await bcrypt.compare(pass, password_hash)
    }

    validateLogin = async (username, pass) => {
        try {
            const user = await this.usersRepository.getByUsername({ username })
            const passMatch = await this.validatePassword(pass, user.password_hash)
            if (!passMatch) {
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
            process.env.JWT_SECRET,
            { expiresIn: "10m" }
        );
    }

    generateRefreshToken = (user) => {
        return jwt.sign(
            {
                id: user.id
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );
    }

    refreshLogin = async (refreshToken) => {
        try {
            const payload = jwt.verify(
                refreshToken,
                process.env.JWT_SECRET
            )

            const user = await this.usersRepository.getById({
                id: payload.id
            })

            return { token: this.generateToken(user), user }
        } catch (error) {
            throw new AppError("Invalid refresh token", 401, error)
        }
    }
}


