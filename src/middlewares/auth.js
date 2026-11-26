import { ACCESS_TOKEN, verifyToken } from "../utils/jwtHelper.js";

import { JWT_SECRET } from "../config/env.js";

export function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Authentication required",
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = verifyToken({
            token,
            secret: JWT_SECRET,
            expectedType: ACCESS_TOKEN
        });

        req.user = decoded;

        next();
    } catch {
        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
}