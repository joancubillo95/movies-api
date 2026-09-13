export class UsersController {
    constructor({ usersRepository }) {
        this.usersRepository = usersRepository
    }

    getById = async (req, res) => {
        const { id } = req.params
        const user = await this.usersRepository.getById({ id })
        return res.json(user)
    }

    getByUsername = async (req, res) => {
        const { username } = req.params
        const user = await this.usersRepository.getByUsername({ username })
        return res.json(user)
    }

    getAll = async (req, res) => {
        const users = await this.usersRepository.getAll()
        return res.json(users)
    }


}