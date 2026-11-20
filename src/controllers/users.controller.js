export class UsersController {
    constructor({ usersRepository }) {
        this.usersRepository = usersRepository
    }

    getById = async (req, res) => {
        const { id } = req.params
        const user = await this.usersRepository.getById({ id })
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        res.json(user)
    }

    getByUsername = async (req, res) => {
        const { username } = req.params
        const user = await this.usersRepository.getByUsername({ username })
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        res.json(user)
    }

    getAll = async (req, res) => {
        const users = await this.usersRepository.getAll()
        if (!users) {
            return res.status(404).json({ message: "No users found" })
        }
        res.json(users)
    }
}
