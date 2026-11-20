import { describe, expect, it, vi } from "vitest"

import { MoviesRepository } from "../../../../src/repositories/mssql/movies.mssql.repository.js"

const MOVIE_ID = "550e8400-e29b-41d4-a716-446655440000"

const MOVIE_INPUT = {
    title: "The Matrix",
    year: 1999,
    director: "The Wachowskis",
    duration: 136,
    rate: 8.7,
    poster: "the-matrix.jpg",
    genre: ["Action", "Sci-Fi"],
}

const createRequest = (result = {}) => {
    const response = {
        recordset: [],
        rowsAffected: [0],
        ...result,
    }
    const request = {
        input: vi.fn(() => request),
        query: vi.fn().mockResolvedValue(response),
        execute: vi.fn().mockResolvedValue(response),
    }
    return request
}

const createTransaction = (requests) => {
    let index = 0
    return {
        begin: vi.fn().mockResolvedValue(),
        commit: vi.fn().mockResolvedValue(),
        rollback: vi.fn().mockResolvedValue(),
        request: vi.fn(() => requests[index++]),
    }
}

const createRepository = ({ poolRequest, transaction } = {}) => {
    const database = {
        getPool: vi.fn().mockResolvedValue({
            request: vi.fn(() => poolRequest),
        }),
        createTransaction: vi.fn().mockResolvedValue(transaction),
    }
    const errorMapper = {
        map: vi.fn((error) => error),
    }
    const repository = new MoviesRepository(database, errorMapper)

    return { repository, database, errorMapper }
}

describe("MoviesRepository.getById", () => {
    it("returns the movie with normalized fields and genre split into an array", async () => {
        const request = createRequest({
            recordset: [
                {
                    ID: MOVIE_ID,
                    TITLE: "The Matrix",
                    GENRE: "Action,Sci-Fi",
                },
            ],
        })
        const { repository } = createRepository({ poolRequest: request })

        const movie = await repository.getById(MOVIE_ID)

        expect(request.input).toHaveBeenCalledWith("id", expect.anything(), MOVIE_ID)
        expect(request.query).toHaveBeenCalledWith(
            "SELECT * FROM VW_MOVIES_WITH_GENRES WHERE ID = @id"
        )
        expect(movie).toEqual({
            id: MOVIE_ID,
            title: "The Matrix",
            genre: ["Action", "Sci-Fi"],
        })
    })

    it("returns null when the movie does not exist", async () => {
        const request = createRequest()
        const { repository } = createRepository({ poolRequest: request })

        const movie = await repository.getById(MOVIE_ID)

        expect(movie).toBeNull()
    })

    it("throws the mapped error when the query fails", async () => {
        const error = new Error("query failed")
        const request = createRequest()
        request.query.mockRejectedValue(error)
        const { repository, errorMapper } = createRepository({ poolRequest: request })

        await expect(repository.getById(MOVIE_ID)).rejects.toBe(error)
        expect(errorMapper.map).toHaveBeenCalledWith(error)
    })
})

describe("MoviesRepository.getAll", () => {
    it("returns all movies with normalized fields and genre split into an array", async () => {
        const request = createRequest({
            recordset: [
                {
                    ID: MOVIE_ID,
                    TITLE: "The Matrix",
                    GENRE: "Action,Sci-Fi",
                },
            ],
        })
        const { repository } = createRepository({ poolRequest: request })

        const movies = await repository.getAll()

        expect(request.query).toHaveBeenCalledWith(
            "SELECT * FROM VW_MOVIES_WITH_GENRES"
        )
        expect(movies).toEqual([
            {
                id: MOVIE_ID,
                title: "The Matrix",
                genre: ["Action", "Sci-Fi"],
            },
        ])
    })

    it("returns null when the query returns no recordset", async () => {
        const request = createRequest({ recordset: null })
        const { repository } = createRepository({ poolRequest: request })

        const movies = await repository.getAll()

        expect(movies).toBeNull()
    })
})

describe("MoviesRepository.create", () => {
    it("inserts the movie and its genres in a transaction", async () => {
        const newIdRequest = createRequest({ recordset: [{ ID: MOVIE_ID }] })
        const insertRequest = createRequest({ rowsAffected: [1] })
        const firstGenreRequest = createRequest({ rowsAffected: [1] })
        const secondGenreRequest = createRequest({ rowsAffected: [1] })
        const selectRequest = createRequest({
            recordset: [
                {
                    ID: MOVIE_ID,
                    TITLE: MOVIE_INPUT.title,
                    YEAR: MOVIE_INPUT.year,
                    DIRECTOR: MOVIE_INPUT.director,
                    DURATION: MOVIE_INPUT.duration,
                    RATE: MOVIE_INPUT.rate,
                    POSTER: MOVIE_INPUT.poster,
                },
            ],
        })
        const transaction = createTransaction([
            newIdRequest,
            insertRequest,
            firstGenreRequest,
            secondGenreRequest,
            selectRequest,
        ])
        const { repository } = createRepository({ transaction })

        const movie = await repository.create({ input: MOVIE_INPUT })

        expect(transaction.begin).toHaveBeenCalledTimes(1)
        expect(newIdRequest.query).toHaveBeenCalledWith("SELECT NEWID() ID")
        expect(insertRequest.query).toHaveBeenCalledWith(
            "INSERT INTO MOVIE (ID, TITLE, YEAR, DIRECTOR, DURATION, RATE, POSTER)"
            + " VALUES(@id, @title, @year, @director, @duration, @rate, @poster)"
        )
        expect(insertRequest.input).toHaveBeenCalledWith(
            "title",
            expect.anything(),
            MOVIE_INPUT.title
        )
        expect(firstGenreRequest.input).toHaveBeenCalledWith(
            "genre",
            expect.anything(),
            "action"
        )
        expect(secondGenreRequest.input).toHaveBeenCalledWith(
            "genre",
            expect.anything(),
            "sci-fi"
        )
        expect(transaction.commit).toHaveBeenCalledTimes(1)
        expect(transaction.rollback).not.toHaveBeenCalled()
        expect(movie).toEqual({
            id: MOVIE_ID,
            title: MOVIE_INPUT.title,
            year: MOVIE_INPUT.year,
            director: MOVIE_INPUT.director,
            duration: MOVIE_INPUT.duration,
            rate: MOVIE_INPUT.rate,
            poster: MOVIE_INPUT.poster,
            genre: MOVIE_INPUT.genre,
        })
    })

    it("inserts the movie without genres when the genre list is empty", async () => {
        const newIdRequest = createRequest({ recordset: [{ ID: MOVIE_ID }] })
        const insertRequest = createRequest({ rowsAffected: [1] })
        const selectRequest = createRequest({
            recordset: [{ ID: MOVIE_ID, TITLE: MOVIE_INPUT.title }],
        })
        const transaction = createTransaction([
            newIdRequest,
            insertRequest,
            selectRequest,
        ])
        const { repository } = createRepository({ transaction })

        const movie = await repository.create({
            input: { ...MOVIE_INPUT, genre: [] },
        })

        expect(transaction.request).toHaveBeenCalledTimes(3)
        expect(transaction.commit).toHaveBeenCalledTimes(1)
        expect(movie.genre).toEqual([])
    })

    it("rolls back when the insert fails", async () => {
        const error = new Error("insert failed")
        const newIdRequest = createRequest({ recordset: [{ ID: MOVIE_ID }] })
        const insertRequest = createRequest()
        insertRequest.query.mockRejectedValue(error)
        const transaction = createTransaction([newIdRequest, insertRequest])
        const { repository, errorMapper } = createRepository({ transaction })

        await expect(repository.create({ input: MOVIE_INPUT })).rejects.toBe(error)

        expect(transaction.rollback).toHaveBeenCalledTimes(1)
        expect(errorMapper.map).toHaveBeenCalledWith(error)
    })
})

describe("MoviesRepository.update", () => {
    it("updates all provided fields and genres and returns the affected row count", async () => {
        const updateRequest = createRequest({ rowsAffected: [1] })
        const genreRequest = createRequest({ rowsAffected: [1, 1] })
        const transaction = createTransaction([updateRequest, genreRequest])
        const { repository } = createRepository({ transaction })

        const rowsAffected = await repository.update({
            id: MOVIE_ID,
            input: MOVIE_INPUT,
        })

        expect(updateRequest.query).toHaveBeenCalledWith(
            "UPDATE MOVIE SET TITLE = @title,YEAR = @year,DIRECTOR = @director,"
            + "DURATION = @duration,RATE = @rate,POSTER = @poster  WHERE ID = @id"
        )
        expect(genreRequest.execute).toHaveBeenCalledWith("UPDATE_MOVIE_GENRES")
        expect(genreRequest.input).toHaveBeenCalledWith(
            "genres",
            expect.anything(),
            "Action,Sci-Fi"
        )
        expect(transaction.commit).toHaveBeenCalledTimes(1)
        expect(rowsAffected).toBe(3)
    })

    it("updates only the provided fields when genres are not given", async () => {
        const updateRequest = createRequest({ rowsAffected: [1] })
        const transaction = createTransaction([updateRequest])
        const { repository } = createRepository({ transaction })

        const rowsAffected = await repository.update({
            id: MOVIE_ID,
            input: { title: "The Matrix Reloaded" },
        })

        expect(updateRequest.query).toHaveBeenCalledWith(
            "UPDATE MOVIE SET TITLE = @title  WHERE ID = @id"
        )
        expect(transaction.request).toHaveBeenCalledTimes(1)
        expect(transaction.commit).toHaveBeenCalledTimes(1)
        expect(rowsAffected).toBe(1)
    })

    it("updates only the genres when no fields are given", async () => {
        const updateRequest = createRequest()
        const genreRequest = createRequest({ rowsAffected: [1, 1] })
        const transaction = createTransaction([updateRequest, genreRequest])
        const { repository } = createRepository({ transaction })

        const rowsAffected = await repository.update({
            id: MOVIE_ID,
            input: { genre: ["Action"] },
        })

        expect(updateRequest.query).not.toHaveBeenCalled()
        expect(genreRequest.execute).toHaveBeenCalledWith("UPDATE_MOVIE_GENRES")
        expect(transaction.commit).toHaveBeenCalledTimes(1)
        expect(rowsAffected).toBe(2)
    })

    it("skips the genre update when the genre list is empty", async () => {
        const updateRequest = createRequest({ rowsAffected: [1] })
        const transaction = createTransaction([updateRequest])
        const { repository } = createRepository({ transaction })

        const rowsAffected = await repository.update({
            id: MOVIE_ID,
            input: { title: "The Matrix Reloaded", genre: [] },
        })

        expect(updateRequest.query).toHaveBeenCalledWith(
            "UPDATE MOVIE SET TITLE = @title  WHERE ID = @id"
        )
        expect(transaction.request).toHaveBeenCalledTimes(1)
        expect(rowsAffected).toBe(1)
    })

    it("throws when there is nothing to update", async () => {
        const updateRequest = createRequest()
        const transaction = createTransaction([updateRequest])
        const { repository } = createRepository({ transaction })

        await expect(repository.update({ id: MOVIE_ID, input: {} }))
            .rejects.toThrow("Nothing to update")
        expect(updateRequest.query).not.toHaveBeenCalled()
        expect(transaction.rollback).toHaveBeenCalledTimes(1)
    })

    it("throws when there is nothing to update and the genre list is empty", async () => {
        const updateRequest = createRequest()
        const transaction = createTransaction([updateRequest])
        const { repository } = createRepository({ transaction })

        await expect(repository.update({ id: MOVIE_ID, input: { genre: [] } }))
            .rejects.toThrow("Nothing to update")
        expect(updateRequest.query).not.toHaveBeenCalled()
        expect(transaction.rollback).toHaveBeenCalledTimes(1)
    })

    it("rolls back when an update query fails", async () => {
        const error = new Error("update failed")
        const updateRequest = createRequest()
        updateRequest.query.mockRejectedValue(error)
        const transaction = createTransaction([updateRequest])
        const { repository, errorMapper } = createRepository({ transaction })

        await expect(
            repository.update({ id: MOVIE_ID, input: { title: "The Matrix" } })
        ).rejects.toBe(error)

        expect(transaction.rollback).toHaveBeenCalledTimes(1)
        expect(errorMapper.map).toHaveBeenCalledWith(error)
    })
})

describe("MoviesRepository.delete", () => {
    it("deletes a movie with its id and returns true when a row was affected", async () => {
        const request = createRequest({ rowsAffected: [1] })
        const { repository } = createRepository({ poolRequest: request })

        const result = await repository.delete({ id: MOVIE_ID })

        expect(request.input).toHaveBeenCalledWith("id", expect.anything(), MOVIE_ID)
        expect(request.query).toHaveBeenCalledWith(
            "DELETE FROM MOVIE WHERE ID = @id"
        )
        expect(result).toBe(true)
    })

    it("returns false when no row was affected", async () => {
        const request = createRequest({ rowsAffected: [0] })
        const { repository } = createRepository({ poolRequest: request })

        const result = await repository.delete({ id: MOVIE_ID })

        expect(result).toBe(false)
    })

    it("throws the mapped error when the query fails", async () => {
        const error = new Error("query failed")
        const request = createRequest()
        request.query.mockRejectedValue(error)
        const { repository, errorMapper } = createRepository({ poolRequest: request })

        await expect(repository.delete({ id: MOVIE_ID })).rejects.toBe(error)
        expect(errorMapper.map).toHaveBeenCalledWith(error)
    })
})
