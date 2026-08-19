export class BaseRepository {
    constructor(database, errorMapper) {
        this.database = database
        this.errorMapper = errorMapper
    }
}
