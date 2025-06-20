const connection = require("../data/db");

function index(req, res) {
  const publishersQuery = "SELECT * FROM publishers";
  const videogamesQuery = "SELECT * FROM videogames";

  connection.query(publishersQuery, (err, publishersResult) => {
    if (err) return res.status(500).json({ error: "Database query failed" });

    connection.query(videogamesQuery, (err, videogamesResult) => {
      if (err) return res.status(500).json({ error: "Database query failed" });

      const publisherVideogames = publishersResult.map((publisher) => {
        const publisherVideogames = videogamesResult
          .filter((videogame) => videogame.publisher_id === publisher.id)
          .map((videogame) => ({
            ...videogame,
            image: req.imagePath + videogame.image,
          }));

        return {
          ...publisher,
          videogames: publisherVideogames,
        };
      });

      res.status(200).json(publisherVideogames);
    });
  });
}

module.exports = { index };
