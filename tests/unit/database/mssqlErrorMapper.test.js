import { describe, expect, it } from "vitest";

import { AppError } from "../../../src/utils/appError";
import { MssqlErrorMapper } from "../../../src/utils/ErrorMappers/mssqlErrorMapper";

describe("MssqlErrorMapper", () => {
    it("maps duplicate errors to AppError", () => {
        const mapper = new MssqlErrorMapper()

        const error = {
            code: "EREQUEST",
            number: 2627
        }

        const result = mapper.map(error)

        expect(result).toBeInstanceOf(AppError)
        expect(result.statusCode).toBe(409)
        expect(result.message).toBe("Duplicate value detected")
        expect(result.originalError).toBe(error)
    })
})