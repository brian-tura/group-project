const connection = require("../data/db");

function index(req, res) {
  const platformsQuery = "SELECT * FROM platforms";

  connection.query(platformsQuery, (err, platformsResult) => {
    if (err) return res.status(500).json({ error: "Database query failed" });

    res.status(200).json(platformsResult);
  });
}

module.exports = { index };
