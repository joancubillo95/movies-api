-- Run this script against the database configured in DB_DATABASE.
-- It creates objects only when they are absent and never drops or recreates the database.

CREATE TABLE IF NOT EXISTS movie (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) UNIQUE NOT NULL,
    year INT NOT NULL,
    director VARCHAR(255) NOT NULL,
    duration INT NOT NULL,
    poster VARCHAR(255),
    rate DECIMAL(3,1) NOT NULL CHECK (rate >= 0 AND rate <= 10.0)
);


CREATE TABLE IF NOT EXISTS genre (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS movie_genres (
    movie_id UUID,
    genre_id INT,
    PRIMARY KEY (movie_id, genre_id),

    CONSTRAINT fk_moviegenres_movie FOREIGN KEY (movie_id)
        REFERENCES movie(id) ON DELETE CASCADE,

    CONSTRAINT fk_moviegenres_genre FOREIGN KEY (genre_id)
        REFERENCES genre(id)
);


INSERT INTO genre (name) VALUES
    ('Drama'), ('Action'), ('Crime'), ('Adventure'), ('Sci-Fi'), ('Romance'),
    ('Comedy'), ('Fantasy'), ('Horror'), ('Thriller')
ON CONFLICT (name) DO NOTHING;
