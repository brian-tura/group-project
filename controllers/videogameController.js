const connection = require('../data/db.js');

function index(req, res){
    connection.query("SELECT * FROM videogames", (err, videogamesResult) => {
        if(err) return res.status(500).json({error: "Database query failed"});

        res.status(200).json({success: true, data: videogamesResult})
    })
}

function show(req, res){
    const id = req.params.id

    // queries
    const videogameQuery = `SELECT * FROM videogames WHERE id = ?`
    const videogamePlatformsQuery = `
        SELECT *
        FROM videogame_platform
        JOIN platforms
        ON videogame_platform.platform_id = platforms.id
        WHERE videogame_id = ?
        `;
    const videogamePublisherQuery = `
        SELECT publishers.id, publishers.name
        FROM videogames
        JOIN publishers
        ON videogames.publisher_id = publishers.id
        WHERE videogames.id = 1
    `;
    const videogameGenresQuery = `
        SELECT *
        FROM videogame_genre
        JOIN genres
        ON videogame_genre.genre_id = genres.id
        WHERE videogame_genre.videogame_id = ?;
    `;

    connection.query(videogameQuery, [id], (err, videogameResult) => {
        if(err) return res.status(500).json({error: "Database query failed"});
        
        if (videogameResult.length === 0 || !videogameResult) {
            return res.status(404).send({
                error: 'Not Found',
                message: 'Videogame not found'
            })
        }

        connection.query(videogamePlatformsQuery, [id], (err, videogamePlatformResult) => {

            if(err) return res.status(500).json({error: "Database query failed"})

            videogameResult[0].platforms = videogamePlatformResult

        })

        connection.query(videogamePublisherQuery, [id], (err, videogamePublisherResult) => {

            if(err) return res.status(500).json({error: "Database query failed"})

            videogameResult[0].publisher = videogamePublisherResult

        })

        connection.query(videogameGenresQuery, [id], (err, videogameGenresResult) => {

            if(err) return res.status(500).json({error: "Database query failed"})

            videogameResult[0].genres = videogameGenresResult

            res.status(200).json(videogameResult)
        })
    })
   
}



module.exports = {index, show}