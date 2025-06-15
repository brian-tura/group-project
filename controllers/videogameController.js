const connection = require("../data/db.js");

function index(req, res) {
  /**
   *************************
   *    QUERIES
   *************************
   * WHERE ... IN -> array -> (?)
   * WHERE ... = -> single elemrnt
   */
  const videogamesQuery = `
    SELECT *
    FROM videogames
  `;

  const videogamesPlatformQuery = `
    SELECT videogame_id, platforms.id AS platform_id, platforms.name
    FROM videogame_platform
    JOIN platforms ON videogame_platform.platform_id = platforms.id
    WHERE videogame_id IN (?)
  `;

  const videogamesPublisherQuery = `
    SELECT id, name
    FROM publishers
  `;

  const videogamesGenresQuery = `
    SELECT videogame_id, genres.id AS genre_id, genres.name
    FROM videogame_genre
    JOIN genres ON videogame_genre.genre_id = genres.id
    WHERE videogame_genre.videogame_id IN (?)
  `;

  /**
   *************************
   *    CONNECTIONS
   * ***********************
   * 1 - connection to get videogames
   * 2 - connectio to get videogames platforms by videogames ids
   * 3 - connectio to get videogames publisherby videogames ids
   * 4 - connection to get videogames genres by videogames ids
   *
   * - use result to filter() platfporms and genres and find() publisher
   * - return NEW composite videogames
   */

  connection.query(videogamesQuery, (err, videogamesResult) => {
    if (err) return res.status(500).json({ error: "Database query failed" });
    // console.log("videogamesResult", videogamesResult);

    // store videogame ids
    const ids = videogamesResult.map((videogame) => videogame.id);
    // console.log('array di id', ids);

    // get platforms
    connection.query(
      videogamesPlatformQuery,
      [ids],
      (error, videogamePlatformsResults) => {
        if (error)
          return res.status(500).json({ error: "Database query failed" });
        // console.log("videogamePlatforms: ", videogamePlatformsResults);

        // get publishers
        connection.query(
          videogamesPublisherQuery,
          (err, videogamePublisherResult) => {
            if (err)
              return res.status(500).json({ error: "Database query failed" });
            // console.log("videogamePublisher: ", videogamePublisherResult);

            // get genres
            connection.query(
              videogamesGenresQuery,
              [ids],
              (error, videogameGenresResults) => {
                if (error)
                  return res
                    .status(500)
                    .json({ error: "Database query failed" });
                // console.log("videogame genres: ", videogameGenresResults);

                /**
                 *
                 *  composition of videogame with joined properties
                 *
                 */
                const compositeVideogame = videogamesResult.map((videogame) => {
                  const platforms = videogamePlatformsResults
                    .filter(
                      (platform) => platform.videogame_id === videogame.id
                    )
                    .map((platform) => ({
                      id: platform.platform_id,
                      name: platform.name,
                    }));
                  const publisher =
                    videogamePublisherResult.find(
                      (publisher) => publisher.id === videogame.publisher_id
                    ) || null;
                  const genres = videogameGenresResults
                    .filter((genre) => genre.videogame_id === videogame.id)
                    .map((genre) => ({
                      id: genre.genre_id,
                      name: genre.name,
                    }));

                  return {
                    ...videogame,
                    platforms: platforms,
                    publisher: publisher,
                    genres: genres,
                  };
                });
                console.log("composite videogame: ", compositeVideogame);

                res
                  .status(200)
                  .json({ success: true, data: compositeVideogame });
              }
            );
          }
        );
      }
    );
  });
}

function show(req, res) {
  const id = req.params.id;

  /**
   *************************
   *    QUERIES
   *************************
   */
  const videogameQuery = `
    SELECT * FROM videogames WHERE id = ?
  `;

  const videogamePlatformsQuery = `
    SELECT platforms.id, platforms.name
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
    WHERE videogames.id = ?
  `;

  const videogameGenresQuery = `
    SELECT genres.id, genres.name
    FROM videogame_genre
    JOIN genres
    ON videogame_genre.genre_id = genres.id
    WHERE videogame_genre.videogame_id = ?
  `;

  /**
   *************************
   *    CONNECTIONS
   * ***********************
   * 1 - connection to get videogame
   * 2 - connectio to get videogame platforms by videogame id
   * 3 - connectio to get videogame publisher by videogame id
   * 4 - connection to get videogame genres by videogame id
   */
  connection.query(videogameQuery, [id], (err, videogameResult) => {
    if (err) return res.status(500).json({ error: "Database query failed" });

    if (videogameResult.length === 0 || !videogameResult) {
      return res.status(404).send({
        error: "Not Found",
        message: "Videogame not found",
      });
    }

    connection.query(
      videogamePlatformsQuery,
      [id],
      (err, videogamePlatformResult) => {
        if (err)
          return res.status(500).json({ error: "Database query failed" });

        videogameResult[0].platforms = videogamePlatformResult;
      }
    );

    connection.query(
      videogamePublisherQuery,
      [id],
      (err, videogamePublisherResult) => {
        if (err)
          return res.status(500).json({ error: "Database query failed" });

        videogameResult[0].publisher = videogamePublisherResult;
      }
    );

    connection.query(
      videogameGenresQuery,
      [id],
      (err, videogameGenresResult) => {
        if (err)
          return res.status(500).json({ error: "Database query failed" });

        videogameResult[0].genres = videogameGenresResult;

        res.status(200).json({ success: true, data: videogameResult });
      }
    );
  });
}

function search(req, res) {
  const search = req.query.q;

  if (!search) return res.status(400).json({ error: "No search value" });

  const videogamesSearchQuery = `
    SELECT *
    FROM videogames
    WHERE LOWER(name) LIKE LOWER(?)
  `;

  /**
   *************************
   *    CONNECTION
   * ***********************
   * 1 - connection to get videogame by q param
   */
  connection.query(
    videogamesSearchQuery,
    [`%${search}%`],
    (err, videogamesSearchResult) => {
      if (err) return res.status(500).json({ error: "Database query failed" });

      if (videogamesSearchResult.length === 0)
        return res.status(404).json({ error: "No videogames found" });

      res.status(200).json({ success: true, data: videogamesSearchResult });
    }
  );
}

module.exports = { index, show, search };
