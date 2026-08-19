export class LoginController {
    constructor({ loginService }) {
        this.loginService = loginService
    }

    login = async (req, res) => {

        const { username, password } = req.body
        const token = await this.loginService.validateLogin(username, password)
        res.json({ token })
    }
}