import { describe, expect, it, vi } from "vitest"

import { MoviesRepository } from "../../../../src/repositories/pg/movies.postgres.repository.js"

describe("MoviesRepository.getById", () => {
    it("returns the movie with genre split into an array", async () => {
        const id = "550e8400-e29b-41d4-a716-446655440000"
        const query = vi.fn().mockResolvedValue({
            rows: [
                {
                    id,
                    title: "The Matrix",
                    genre: "Action,Sci-Fi",
                },
            ],
        })
        const database = {
            getPool: vi.fn().mockResolvedValue({ query }),
        }
        const errorMapper = {
            map: vi.fn((error) => error),
        }
        const repository = new MoviesRepository(database, errorMapper)

        const movie = await repository.getById(id)

        expect(query).toHaveBeenCalledWith(
            "SELECT * FROM VW_MOVIES_WITH_GENRES WHERE ID = $1",
            [id],
        )
        expect(movie).toEqual({
            id,
            title: "The Matrix",
            genre: ["Action", "Sci-Fi"],
        })
    })
})
