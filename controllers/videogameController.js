const videogames = require('../data/db.js');




function show(req, res) {
    const id = req.params.id

    const videogameSql = `SELECT * FROM movies WHERE id = ?`

    connection.query(videogameSql, [id], (err, videogameResult) => {
        if (err) {
            return res.status(500).json({ error: "Database query failed" })
        }

        if (videogameResult.length === 0 || videogameResult[0].id === null) {
            return res.status(404).json({ error: 'Not Found' })
        }

        res.json(videogameResult)
    })
}

module.exports = {show}