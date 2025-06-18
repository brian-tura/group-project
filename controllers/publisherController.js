const connection = require("../data/db");

function index(req, res) {
  const publishersQuery = "SELECT * FROM publishers";

  connection.query(publishersQuery, (err, publishersResult) => {
    if (err) return res.status(500).json({ error: "Database query failed" });

    res.status(200).json(publishersResult);
  });
}

module.exports = { index };
