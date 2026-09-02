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
            return token
        } catch (error) {
            console.error("Error validating login:", error)
            throw error
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
}


