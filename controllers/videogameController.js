const videogames = require('../data/db.js');




function show(req, res) {
    const id = parseInt(req.params.id);
    const videogame = videogames.find(videogame => videogame.id === id)
    if(!videogame) {
        res.sendStatus(404)
    }
    res.json(videogame)
}

module.exports = {show}