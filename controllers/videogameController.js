const connection = require("../data/db.js");

function index(req, res) {
  const search = req.query.q;
  const sort = req.query.sort;
  const order = req.query.order;

  const sortingColumnsValidation = {
    name: "name",
    release: "release_date",
    price: "price",
  };

  const orderOptionsValidation = {
    asc: "ASC",
    desc: "DESC",
  };

  const sortCol = sortingColumnsValidation[sort];
  const orderOpt = orderOptionsValidation[order];

  let videogamesQuery = "SELECT * FROM videogames";

  let params = [];

  if (search) {
    videogamesQuery += " WHERE LOWER(name) LIKE LOWER(?)";
    params.push(`%${search}%`);
  }
  if (sortCol) {
    videogamesQuery += ` ORDER BY ${sortCol} ${orderOpt || "ASC"}`;
  }

  connection.query(videogamesQuery, params, (err, videogamesResult) => {
    if (err) return res.status(500).json({ error: "Database query failed" });

    if (videogamesResult.length === 0)
      return res.status(404).json({ error: "No videogames found" });

    const videogamesPlatformQuery = `
        SELECT videogame_id, platforms.id AS platform_id, platforms.name
        FROM videogame_platform
        LEFT JOIN platforms ON videogame_platform.platform_id = platforms.id
        WHERE videogame_id IN (?)
      `;

    const videogamesPublisherQuery = `
        SELECT id, name
        FROM publishers
      `;

    const videogamesGenresQuery = `
        SELECT videogame_id, genres.id AS genre_id, genres.name
        FROM videogame_genre
        LEFT JOIN genres ON videogame_genre.genre_id = genres.id
        WHERE videogame_genre.videogame_id IN (?)
      `;

    // store videogame ids
    const ids = videogamesResult.map((videogame) => videogame.id);
    // console.log("array di id", ids);

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

                const compositeVideogames = videogamesResult.map(
                  (videogame) => {
                    const platforms = videogamePlatformsResults
                      .filter(
                        (platform) => platform.videogame_id === videogame.id
                      )
                      .map((platform) => ({
                        id: platform.platform_id,
                        name: platform.name,
                      }));
                    // console.log(platforms);

                    const publisher =
                      videogamePublisherResult.find(
                        (publisher) => publisher.id === videogame.publisher_id
                      ) || null;
                    // console.log(publisher);

                    const genres = videogameGenresResults
                      .filter((genre) => genre.videogame_id === videogame.id)
                      .map((genre) => ({
                        id: genre.genre_id,
                        name: genre.name,
                      }));

                    return {
                      ...videogame,
                      image: req.imagePath + videogame.image,
                      platforms: platforms,
                      publisher: publisher,
                      genres: genres,
                    };
                  }
                );
                // console.log("composite videogame: ", compositeVideogame);

                res.status(200).json(compositeVideogames);
              }
            );
          }
        );
      }
    );
  });
}

function show(req, res) {
  const slug = req.params.slug;

  /**
   *************************
   *    QUERIES
   *************************
   */
  const videogameQuery = `
    SELECT * FROM videogames WHERE slug = ?
  `;

  const videogamePlatformsQuery = `
    SELECT platforms.id, platforms.name
    FROM videogame_platform
    LEFT JOIN platforms
    ON videogame_platform.platform_id = platforms.id
    WHERE videogame_id = ?
  `;

  const videogamePublisherQuery = `
    SELECT publishers.id, publishers.name
    FROM videogames
    LEFT JOIN publishers
    ON videogames.publisher_id = publishers.id
    WHERE videogames.id = ?
  `;

  const videogameGenresQuery = `
    SELECT genres.id, genres.name
    FROM videogame_genre
    LEFT JOIN genres
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
  connection.query(videogameQuery, [slug], (err, videogameResult) => {
    if (err) return res.status(500).json({ error: "Database query failed" });

    if (videogameResult.length === 0 || !videogameResult) {
      return res.status(404).send({
        error: "Not Found",
        message: "Videogame not found",
      });
    }

    const videogame = videogameResult[0];

    const id = videogame.id;

    console.log(videogame);

    connection.query(
      videogamePlatformsQuery,
      [id],
      (err, videogamePlatformResult) => {
        if (err)
          return res.status(500).json({ error: "Database query failed" });

        videogame.platform = videogamePlatformResult;
      }
    );

    connection.query(
      videogamePublisherQuery,
      [id],
      (err, videogamePublisherResult) => {
        if (err)
          return res.status(500).json({ error: "Database query failed" });

        videogame.publisher = videogamePublisherResult;
      }
    );

    connection.query(
      videogameGenresQuery,
      [id],
      (err, videogameGenresResult) => {
        if (err)
          return res.status(500).json({ error: "Database query failed" });

        videogame.image = req.imagePath + videogame.image;
        videogame.genres = videogameGenresResult;

        res.status(200).json(videogame);
      }
    );
  });
}

// function search(req, res) {
//   const search = req.query.q;
//   const sort = req.query.sort;
//   const order = req.query.order;

//   if (!search) return res.status(400).json({ error: "No search value" });

//   console.log(sortCol);

//   let videogamesSearchQuery = `
//     SELECT *
//     FROM videogames
//     WHERE LOWER(name) LIKE LOWER(?)
//   `;

//   if (sortCol) {
//     orderOpt
//       ? (videogamesSearchQuery += `ORDER BY ${sortCol} ${orderOpt}`)
//       : (videogamesSearchQuery += `ORDER BY ${sortCol}`);
//   }

//   /**
//    *************************
//    *    CONNECTION
//    * ***********************
//    * 1 - connection to get videogame by q param
//    */
//   connection.query(
//     videogamesSearchQuery,
//     [`%${search}%`],
//     (err, videogamesSearchResult) => {
//       if (err) return res.status(500).json({ error: "Database query failed" });

//       if (videogamesSearchResult.length === 0)
//         return res.status(404).json({ error: "No videogames found" });

//       res.status(200).json(videogamesSearchResult);
//     }
//   );
// }

module.exports = { index, show };
