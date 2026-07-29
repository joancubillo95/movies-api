CREATE OR REPLACE VIEW vw_movies_with_genres AS
SELECT 
    m.id,
    m.title,
    m.year,
    m.director,
    m.duration,
    m.poster,
    m.rate,
    STRING_AGG(g.name, ',' ORDER BY g.name) AS genre
FROM movie m
INNER JOIN movie_genres mg ON m.id = mg.movie_id
INNER JOIN genre g ON g.id = mg.genre_id
GROUP BY m.id, m.title, m.year, m.director, m.duration, m.poster, m.rate;