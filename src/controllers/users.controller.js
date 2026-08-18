export class UsersController {
    constructor({ usersRepository }) {
        this.usersRepository = usersRepository
    }

    getAll = async (req, res) => {
        const users = await this.usersRepository.getAll()
        return res.json(users)
    }
}