import { describe, expect, it, vi } from "vitest"

import { UsersRepository } from "../../../../src/repositories/mssql/users.repository.js"

const USER_ID = "550e8400-e29b-41d4-a716-446655440000"

const createRequest = (recordset = []) => {
    const request = {
        input: vi.fn(() => request),
        query: vi.fn().mockResolvedValue({ recordset }),
    }
    return request
}

const createRepository = (request) => {
    const database = {
        getPool: vi.fn().mockResolvedValue({
            request: vi.fn(() => request),
        }),
    }
    const errorMapper = {
        map: vi.fn((error) => error),
    }
    const repository = new UsersRepository(database, errorMapper)

    return { repository, database, errorMapper }
}

describe("UsersRepository.login", () => {
    it("returns the user with normalized fields including the password hash", async () => {
        const request = createRequest([
            {
                ID: USER_ID,
                USERNAME: "Admin",
                ROLE: "admin",
                PASSWORD_HASH: "hashed-password",
            },
        ])
        const { repository } = createRepository(request)

        const user = await repository.login({ username: "Admin" })

        expect(request.input).toHaveBeenCalledWith(
            "username",
            expect.anything(),
            "ADMIN"
        )
        expect(request.query).toHaveBeenCalledWith(
            "SELECT ID, USERNAME, ROLE, PASSWORD_HASH FROM USERS WHERE UPPER(USERNAME) = @username"
        )
        expect(user).toEqual({
            id: USER_ID,
            username: "Admin",
            role: "admin",
            password_hash: "hashed-password",
        })
    })

    it("returns undefined when the user does not exist", async () => {
        const request = createRequest()
        const { repository } = createRepository(request)

        const user = await repository.login({ username: "missing" })

        expect(user).toBeUndefined()
    })

    it("throws the mapped error when the query fails", async () => {
        const error = new Error("query failed")
        const request = createRequest()
        request.query.mockRejectedValue(error)
        const { repository, errorMapper } = createRepository(request)

        await expect(repository.login({ username: "Admin" })).rejects.toBe(error)
        expect(errorMapper.map).toHaveBeenCalledWith(error)
    })
})

describe("UsersRepository.getByUsername", () => {
    it("returns the user without the password hash", async () => {
        const request = createRequest([
            {
                ID: USER_ID,
                USERNAME: "Admin",
                ROLE: "admin",
            },
        ])
        const { repository } = createRepository(request)

        const user = await repository.getByUsername({ username: "Admin" })

        expect(request.input).toHaveBeenCalledWith(
            "username",
            expect.anything(),
            "ADMIN"
        )
        expect(request.query).toHaveBeenCalledWith(
            "SELECT ID, USERNAME, ROLE FROM USERS WHERE UPPER(USERNAME) = @username"
        )
        expect(user).toEqual({
            id: USER_ID,
            username: "Admin",
            role: "admin",
        })
    })

    it("returns undefined when the user does not exist", async () => {
        const request = createRequest()
        const { repository } = createRepository(request)

        const user = await repository.getByUsername({ username: "missing" })

        expect(user).toBeUndefined()
    })
})

describe("UsersRepository.getById", () => {
    it("returns the user without the password hash", async () => {
        const request = createRequest([
            {
                ID: USER_ID,
                USERNAME: "Admin",
                ROLE: "admin",
            },
        ])
        const { repository } = createRepository(request)

        const user = await repository.getById({ id: USER_ID })

        expect(request.input).toHaveBeenCalledWith("id", expect.anything(), USER_ID)
        expect(request.query).toHaveBeenCalledWith(
            "SELECT ID, USERNAME, ROLE FROM USERS WHERE ID = @id"
        )
        expect(user).toEqual({
            id: USER_ID,
            username: "Admin",
            role: "admin",
        })
    })

    it("returns undefined when the user does not exist", async () => {
        const request = createRequest()
        const { repository } = createRepository(request)

        const user = await repository.getById({ id: USER_ID })

        expect(user).toBeUndefined()
    })
})

describe("UsersRepository.getAll", () => {
    it("returns all users without password hashes", async () => {
        const request = createRequest([
            {
                ID: USER_ID,
                USERNAME: "Admin",
                ROLE: "admin",
            },
            {
                ID: "660e8400-e29b-41d4-a716-446655440000",
                USERNAME: "User",
                ROLE: "user",
            },
        ])
        const { repository } = createRepository(request)

        const users = await repository.getAll()

        expect(request.query).toHaveBeenCalledWith(
            "SELECT ID, USERNAME, ROLE FROM USERS"
        )
        expect(users).toEqual([
            {
                id: USER_ID,
                username: "Admin",
                role: "admin",
            },
            {
                id: "660e8400-e29b-41d4-a716-446655440000",
                username: "User",
                role: "user",
            },
        ])
    })

    it("throws the mapped error when the query fails", async () => {
        const error = new Error("query failed")
        const request = createRequest()
        request.query.mockRejectedValue(error)
        const { repository, errorMapper } = createRepository(request)

        await expect(repository.getAll()).rejects.toBe(error)
        expect(errorMapper.map).toHaveBeenCalledWith(error)
    })
})
