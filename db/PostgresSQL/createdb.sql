DROP DATABASE IF EXISTS moviesdb;
CREATE DATABASE moviesdb;

CREATE TABLE movie (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) UNIQUE NOT NULL,
    year INT NOT NULL,
    director VARCHAR(255) NOT NULL,
    duration INT NOT NULL,
    poster VARCHAR(255),
    rate DECIMAL(3,1) NOT NULL CHECK (rate >= 0 AND rate <= 10.0)
);


CREATE TABLE genre (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

INSERT INTO GENRE (NAME) VALUES
('Drama'), ('Action'), ('Crime'), ('Adventure'), ('Sci-Fi'), ('Romance');