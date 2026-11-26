import jwt from "jsonwebtoken"

const ALGORITHM = "HS256"
const ISSUER = "movies-api"
const AUDIENCE = "movies-api-client"

export const ACCESS_TOKEN = "access"
export const REFRESH_TOKEN = "refresh"

export const signToken = ({ payload, secret, type, expiresIn }) => {
    return jwt.sign(
        { ...payload, type },
        secret,
        {
            algorithm: ALGORITHM,
            expiresIn,
            issuer: ISSUER,
            audience: AUDIENCE
        }
    )
}

export const verifyToken = ({ token, secret, expectedType }) => {
    const payload = jwt.verify(token, secret, {
        algorithms: [ALGORITHM],
        issuer: ISSUER,
        audience: AUDIENCE
    })

    if (payload.type !== expectedType) {
        throw new Error(`Expected ${expectedType} token`)
    }

    return payload
}