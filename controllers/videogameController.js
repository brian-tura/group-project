const videogames = require('../data/videogamesList.js');




function show(req, res) {
    const id = parseInt(req.params.id);
    const videogame = videogames.find(videogame => videogame.id === id)
    if(!videogame) {
        res.sendStatus(404)
    }
    res.json(post)
}

module.exports = {show}