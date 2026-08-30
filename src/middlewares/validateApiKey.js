import { API_KEY } from "../config/env.js"

export const validateApiKey = (req, res, next) => {
    if (req.path.startsWith("/api-docs")) {
        return next();
    }
    const clientApiKey = req.headers["api-key"]
    if (!clientApiKey) {
        return res.status(401).json({ message: "API key is missing. Please provide api-key header." })
    } else if (clientApiKey !== API_KEY) {
        return res.status(403).json({ message: "Access denied! Invalid API key." })
    }

    next()
}