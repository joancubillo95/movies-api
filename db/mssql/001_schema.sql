-- Run this script after connecting to the database configured in DB_DATABASE.
-- It creates objects only when they are absent and never drops or recreates the database.

IF OBJECT_ID(N'dbo.MOVIE', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.MOVIE (
        ID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT (NEWID()),
        TITLE VARCHAR(255) UNIQUE NOT NULL,
        YEAR INT NOT NULL,
        DIRECTOR VARCHAR (255) NOT NULL,
        DURATION INT NOT NULL,
        POSTER VARCHAR(255),
        RATE DECIMAL(3,1) NOT NULL CONSTRAINT CK_MOVIES_RATE CHECK (RATE >= 0 AND RATE <= 10.0)
    );
END;

IF OBJECT_ID(N'dbo.GENRE', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.GENRE (
        ID INT IDENTITY(1,1) PRIMARY KEY,
        NAME VARCHAR(255) UNIQUE NOT NULL
    );
END;

IF OBJECT_ID(N'dbo.MOVIE_GENRES', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.MOVIE_GENRES (
        MOVIE_ID UNIQUEIDENTIFIER,
        GENRE_ID INT,
        PRIMARY KEY(MOVIE_ID, GENRE_ID),

        CONSTRAINT FK_MOVIEGENRES_MOVIE FOREIGN KEY (MOVIE_ID)
            REFERENCES dbo.MOVIE(ID) ON DELETE CASCADE,
        
        CONSTRAINT FK_MOVIEGENRES_GENRE FOREIGN KEY (GENRE_ID)
            REFERENCES dbo.GENRE(ID) 
    );
END;

INSERT INTO dbo.GENRE (NAME)
SELECT NAME
FROM (VALUES
    ('Drama'), ('Action'), ('Crime'), ('Adventure'), ('Sci-Fi'), ('Romance'),
    ('Comedy'), ('Fantasy'), ('Horror'), ('Thriller')
) AS G(NAME)
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.GENRE WHERE NAME = G.NAME
);
