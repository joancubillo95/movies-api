import { describe, expect, it, vi } from "vitest"

import { MoviesRepository } from "../../../../src/repositories/pg/movies.postgres.repository.js"

const MOVIE_ID = "550e8400-e29b-41d4-a716-446655440000"

const createPool = (query) => ({ query })

const createTransaction = (query) => ({
    query,
    release: vi.fn().mockResolvedValue(),
})

const createRepository = (pool) => {
    const database = {
        getPool: vi.fn().mockResolvedValue(pool),
    }
    const errorMapper = {
        map: vi.fn((error) => error),
    }
    const repository = new MoviesRepository(database, errorMapper)

    return { repository, database, errorMapper }
}

describe("MoviesRepository.getById", () => {
    it("returns the movie with genre split into an array", async () => {
        const query = vi.fn().mockResolvedValue({
            rows: [
                {
                    id: MOVIE_ID,
                    title: "The Matrix",
                    genre: "Action,Sci-Fi",
                },
            ],
        })
        const { repository } = createRepository(createPool(query))

        const movie = await repository.getById(MOVIE_ID)

        expect(query).toHaveBeenCalledWith(
            "SELECT * FROM VW_MOVIES_WITH_GENRES WHERE ID = $1",
            [MOVIE_ID],
        )
        expect(movie).toEqual({
            id: MOVIE_ID,
            title: "The Matrix",
            genre: ["Action", "Sci-Fi"],
        })
    })

    it("returns null when the movie does not exist", async () => {
        const query = vi.fn().mockResolvedValue({ rows: [] })
        const { repository } = createRepository(createPool(query))

        const movie = await repository.getById(MOVIE_ID)

        expect(movie).toBeNull()
    })

    it("throws the mapped error when the query fails", async () => {
        const error = new Error("query failed")
        const query = vi.fn().mockRejectedValue(error)
        const { repository, errorMapper } = createRepository(createPool(query))

        await expect(repository.getById(MOVIE_ID)).rejects.toBe(error)
        expect(errorMapper.map).toHaveBeenCalledWith(error)
    })
})

describe("MoviesRepository.getAll", () => {
    it("returns all movies with genre split into an array", async () => {
        const query = vi.fn().mockResolvedValue({
            rows: [
                {
                    id: MOVIE_ID,
                    title: "The Matrix",
                    genre: "Action,Sci-Fi",
                },
            ],
        })
        const { repository } = createRepository(createPool(query))

        const movies = await repository.getAll()

        expect(query).toHaveBeenCalledWith(
            "SELECT * FROM VW_MOVIES_WITH_GENRES"
        )
        expect(movies).toEqual([
            {
                id: MOVIE_ID,
                title: "The Matrix",
                genre: ["Action", "Sci-Fi"]
            }
        ])
    })

    it("returns null when the query returns no rows value", async () => {
        const query = vi.fn().mockResolvedValue({ rows: null })
        const { repository } = createRepository(createPool(query))

        const movies = await repository.getAll()

        expect(movies).toBeNull()
    })

    it("throws the mapped error when the query fails", async () => {
        const error = new Error("query failed")
        const query = vi.fn().mockRejectedValue(error)
        const { repository, errorMapper } = createRepository(createPool(query))

        await expect(repository.getAll()).rejects.toBe(error)
        expect(errorMapper.map).toHaveBeenCalledWith(error)
    })
})

describe("MoviesRepository.create", () => {
    const input = {
        title: "The Matrix",
        year: 1999,
        director: "The Wachowskis",
        duration: 136,
        rate: 8.7,
        poster: "the-matrix.jpg",
        genre: ["Action", "Sci-Fi"],
    }

    const createClient = () => ({
        query: vi.fn(async (sql) => {
            if (sql === "SELECT GEN_RANDOM_UUID() ID") {
                return { rows: [{ id: MOVIE_ID }] }
            }
            if (sql.startsWith("INSERT INTO MOVIE ")) {
                return {
                    rows: [
                        {
                            id: MOVIE_ID,
                            title: input.title,
                            year: input.year,
                            director: input.director,
                            duration: input.duration,
                            rate: input.rate,
                            poster: input.poster,
                        },
                    ],
                }
            }
            return { rows: [] }
        }),
        release: vi.fn().mockResolvedValue(),
    })

    it("inserts the movie and its genres in a transaction", async () => {
        const client = createClient()
        const pool = { connect: vi.fn().mockResolvedValue(client) }
        const { repository } = createRepository(pool)

        const movie = await repository.create({ input })

        expect(client.query).toHaveBeenCalledWith("BEGIN")
        expect(client.query).toHaveBeenCalledWith("SELECT GEN_RANDOM_UUID() ID")
        expect(client.query).toHaveBeenCalledWith(
            "INSERT INTO MOVIE (ID, TITLE, YEAR, DIRECTOR, DURATION, RATE, POSTER) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *",
            [
                MOVIE_ID,
                input.title,
                input.year,
                input.director,
                input.duration,
                input.rate,
                input.poster,
            ],
        )
        expect(client.query).toHaveBeenCalledWith(
            "INSERT INTO MOVIE_GENRES (MOVIE_ID, GENRE_ID) VALUES ($1, (SELECT ID FROM GENRE WHERE LOWER(NAME) = $2))",
            [MOVIE_ID, "action"],
        )
        expect(client.query).toHaveBeenCalledWith(
            "INSERT INTO MOVIE_GENRES (MOVIE_ID, GENRE_ID) VALUES ($1, (SELECT ID FROM GENRE WHERE LOWER(NAME) = $2))",
            [MOVIE_ID, "sci-fi"],
        )
        expect(client.query).toHaveBeenCalledWith("COMMIT")
        expect(client.release).toHaveBeenCalledTimes(1)
        expect(movie).toEqual({
            id: MOVIE_ID,
            title: input.title,
            year: input.year,
            director: input.director,
            duration: input.duration,
            rate: input.rate,
            poster: input.poster,
            genre: ["Action", "Sci-Fi"],
        })
    })

    it("inserts the movie without genres when the genre list is empty", async () => {
        const client = createClient()
        const pool = { connect: vi.fn().mockResolvedValue(client) }
        const { repository } = createRepository(pool)

        const movie = await repository.create({
            input: { ...input, genre: [] },
        })

        const genreInserts = client.query.mock.calls.filter(([sql]) =>
            sql.includes("INSERT INTO MOVIE_GENRES")
        )
        expect(genreInserts).toHaveLength(0)
        expect(client.query).toHaveBeenCalledWith("COMMIT")
        expect(movie.genre).toEqual([])
    })

    it("rolls back and releases the client when the insert fails", async () => {
        const error = new Error("insert failed")
        const client = {
            query: vi.fn(async (sql) => {
                if (sql.startsWith("INSERT INTO MOVIE ")) {
                    throw error
                }
                if (sql === "SELECT GEN_RANDOM_UUID() ID") {
                    return { rows: [{ id: MOVIE_ID }] }
                }
                return { rows: [] }
            }),
            release: vi.fn().mockResolvedValue(),
        }
        const pool = { connect: vi.fn().mockResolvedValue(client) }
        const { repository, errorMapper } = createRepository(pool)

        await expect(repository.create({ input })).rejects.toBe(error)
        expect(client.query).toHaveBeenCalledWith("ROLLBACK")
        expect(client.release).toHaveBeenCalledTimes(1)
        expect(errorMapper.map).toHaveBeenCalledWith(error)
    })
})

describe("MoviesRepository.update", () => {
    const input = {
        title: "The Matrix",
        year: 1999,
        director: "The Wachowskis",
        duration: 136,
        rate: 8.7,
        poster: "the-matrix.jpg",
        genre: ["Action", "Sci-Fi"],
    }

    it("updates all provided fields and genres", async () => {
        const query = vi.fn().mockResolvedValue({ rowCount: 1 })
        const transaction = createTransaction(query)
        const pool = { connect: vi.fn().mockResolvedValue(transaction) }
        const { repository } = createRepository(pool)

        const rowsAffected = await repository.update({ id: MOVIE_ID, input })

        expect(query).toHaveBeenCalledWith("BEGIN")
        expect(query).toHaveBeenCalledWith(
            "UPDATE MOVIE SET TITLE = $2,YEAR = $3,DIRECTOR = $4,DURATION = $5,RATE = $6,POSTER = $7 WHERE ID = $1",
            [
                MOVIE_ID,
                input.title,
                input.year,
                input.director,
                input.duration,
                input.rate,
                input.poster,
            ],
        )
        expect(query).toHaveBeenCalledWith(
            "CALL SP_UPDATE_MOVIE_GENRES($1, $2)",
            [MOVIE_ID, "Action,Sci-Fi"],
        )
        expect(query).toHaveBeenCalledWith("COMMIT")
        expect(transaction.release).toHaveBeenCalledTimes(1)
        expect(rowsAffected).toBe(2)
    })

    it("updates only the provided fields when genres are not given", async () => {
        const query = vi.fn().mockResolvedValue({ rowCount: 1 })
        const transaction = createTransaction(query)
        const pool = { connect: vi.fn().mockResolvedValue(transaction) }
        const { repository } = createRepository(pool)

        const rowsAffected = await repository.update({
            id: MOVIE_ID,
            input: { title: "The Matrix Reloaded" },
        })

        expect(query).toHaveBeenCalledWith(
            "UPDATE MOVIE SET TITLE = $2 WHERE ID = $1",
            [MOVIE_ID, "The Matrix Reloaded"],
        )
        expect(query).not.toHaveBeenCalledWith(
            "CALL SP_UPDATE_MOVIE_GENRES($1, $2)",
            expect.anything(),
        )
        expect(query).toHaveBeenCalledWith("COMMIT")
        expect(rowsAffected).toBe(1)
    })

    it("updates only the genres when no fields are given", async () => {
        const query = vi.fn().mockResolvedValue({ rowCount: 1 })
        const transaction = createTransaction(query)
        const pool = { connect: vi.fn().mockResolvedValue(transaction) }
        const { repository } = createRepository(pool)

        const rowsAffected = await repository.update({
            id: MOVIE_ID,
            input: { genre: ["Action"] },
        })

        expect(query).not.toHaveBeenCalledWith(
            expect.stringContaining("UPDATE MOVIE SET"),
            expect.anything(),
        )
        expect(query).toHaveBeenCalledWith(
            "CALL SP_UPDATE_MOVIE_GENRES($1, $2)",
            [MOVIE_ID, "Action"],
        )
        expect(query).toHaveBeenCalledWith("COMMIT")
        expect(rowsAffected).toBe(1)
    })

    it("skips the genre update when the genre list is empty", async () => {
        const query = vi.fn().mockResolvedValue({ rowCount: 1 })
        const transaction = createTransaction(query)
        const pool = { connect: vi.fn().mockResolvedValue(transaction) }
        const { repository } = createRepository(pool)

        const rowsAffected = await repository.update({
            id: MOVIE_ID,
            input: { title: "The Matrix Reloaded", genre: [] },
        })

        expect(query).toHaveBeenCalledWith(
            "UPDATE MOVIE SET TITLE = $2 WHERE ID = $1",
            [MOVIE_ID, "The Matrix Reloaded"],
        )
        expect(query).not.toHaveBeenCalledWith(
            "CALL SP_UPDATE_MOVIE_GENRES($1, $2)",
            expect.anything(),
        )
        expect(rowsAffected).toBe(1)
    })

    it("throws when there is nothing to update", async () => {
        const query = vi.fn().mockResolvedValue({ rowCount: 1 })
        const transaction = createTransaction(query)
        const pool = { connect: vi.fn().mockResolvedValue(transaction) }
        const { repository } = createRepository(pool)

        await expect(repository.update({ id: MOVIE_ID, input: {} }))
            .rejects.toThrow("Nothing to update")
        expect(query).toHaveBeenCalledWith("ROLLBACK")
        expect(transaction.release).toHaveBeenCalledTimes(1)
    })

    it("throws when there is nothing to update and the genre list is empty", async () => {
        const query = vi.fn().mockResolvedValue({ rowCount: 1 })
        const transaction = createTransaction(query)
        const pool = { connect: vi.fn().mockResolvedValue(transaction) }
        const { repository } = createRepository(pool)

        await expect(repository.update({ id: MOVIE_ID, input: { genre: [] } }))
            .rejects.toThrow("Nothing to update")
        expect(query).toHaveBeenCalledWith("ROLLBACK")
        expect(transaction.release).toHaveBeenCalledTimes(1)
    })

    it("rolls back and releases the transaction when a query fails", async () => {
        const error = new Error("update failed")
        const query = vi.fn()
            .mockResolvedValueOnce({ rowCount: 0 })
            .mockRejectedValueOnce(error)
            .mockResolvedValue({ rowCount: 0 })
        const transaction = createTransaction(query)
        const pool = { connect: vi.fn().mockResolvedValue(transaction) }
        const { repository, errorMapper } = createRepository(pool)

        await expect(
            repository.update({ id: MOVIE_ID, input: { title: "The Matrix" } }),
        ).rejects.toBe(error)
        expect(query).toHaveBeenCalledWith("ROLLBACK")
        expect(transaction.release).toHaveBeenCalledTimes(1)
        expect(errorMapper.map).toHaveBeenCalledWith(error)
    })
})

describe("MoviesRepository.delete", () => {
    it("deletes a movie with its id and returns true when a row was affected", async () => {
        const query = vi.fn().mockResolvedValue({ rowCount: 1 })
        const { repository } = createRepository(createPool(query))

        const result = await repository.delete({ id: MOVIE_ID })

        expect(query).toHaveBeenCalledWith(
            "DELETE FROM MOVIE WHERE ID = $1",
            [MOVIE_ID],
        )
        expect(result).toBe(true)
    })

    it("returns false when no row was affected", async () => {
        const query = vi.fn().mockResolvedValue({ rowCount: 0 })
        const { repository } = createRepository(createPool(query))

        const result = await repository.delete({ id: MOVIE_ID })

        expect(result).toBe(false)
    })

    it("throws the mapped error when the query fails", async () => {
        const error = new Error("query failed")
        const query = vi.fn().mockRejectedValue(error)
        const { repository, errorMapper } = createRepository(createPool(query))

        await expect(repository.delete({ id: MOVIE_ID })).rejects.toBe(error)
        expect(errorMapper.map).toHaveBeenCalledWith(error)
    })
})
