export class LoginController {
    constructor({ loginService }) {
        this.loginService = loginService
    }

    login = (req, res) => {

        const { username, password } = req.body
        const token = this.loginService.validateLogin(username, password)
        res.json({ token })
    }
}