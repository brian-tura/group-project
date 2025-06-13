const connection = require('../data/db.js');

function index(req, res){
    connection.query("SELECT * FROM videogames", (err, videogamesResult) => {
        if(err) return res.status(500).json({error: "Database query failed"});

        res.status(200).json({success: true, data: videogamesResult})
    })
}

function show(req, res) {
    const id = req.params.id

    const videogameSql = `SELECT * FROM videogames WHERE id = ?`

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

module.exports = {index, show}