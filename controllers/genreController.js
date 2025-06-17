const connection = require("../data/db");

function index(req, res) {
  const genresQuery = "SELECT * FROM genres";

  connection.query(genresQuery, (err, genresResult) => {
    if (err) return res.status(500).json({ error: "Database query failed" });

    res.status(200).json({ success: true, data: genresResult });
  });
}

module.exports = { index };
