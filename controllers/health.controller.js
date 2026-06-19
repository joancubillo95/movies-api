import { readFileSync } from "fs"
import path from "path"

const pckg = JSON.parse(readFileSync(path.resolve("./package.json"), "utf-8"))

export class HealthController {
    healthCheck = (req, res) => {
        res.json({
            status: "ok",
            version: pckg.version,
            message: "API is running",
            serverTime: new Date().toISOString()
        })
    }
}