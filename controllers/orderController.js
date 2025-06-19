const connection = require("../data/db");

function show(req, res) {
  const id = req.params.id;

  const orderQuery = `
    SELECT orders.id,
    orders.date, 
    orders.status,
    orders.total_amount
    FROM orders
    WHERE orders.id = ?
    `;

  const discountOrderQuery = `
    SELECT 
    discounts.id,
    discounts.discount_code AS discount_code,
    discounts.amount AS discount_amount,
    discounts.start_date,
    discounts.end_date
    FROM orders
    LEFT JOIN discounts ON orders.discount_id = discounts.id
    WHERE orders.id = ?;
    `;

  const videogameOrderQuery = `
    SELECT 
    videogames.name AS videogame_name,
    videogames.price AS videogame_price
    FROM videogames
    INNER JOIN videogame_order ON videogames.id = videogame_order.videogame_id
    WHERE videogame_order.order_id = ?;
    `;

  connection.query(orderQuery, [id], (err, orderResult) => {
    if (err) return res.status(500).json({ error: "Database query failed" });

    if (!orderResult || orderResult.length === 0) {
      return res
        .status(404)
        .json({ error: "Not Found", message: "Order not found" });
    }

    connection.query(discountOrderQuery, [id], (err, discountOrderResult) => {
      if (err) return res.status(500).json({ error: "Database query failed" });

      orderResult[0].discount = discountOrderResult;

      connection.query(
        videogameOrderQuery,
        [id],
        (err, videogameOrderResult) => {
          if (err)
            return res.status(500).json({ error: "Database query failed" });

          orderResult[0].videogames = videogameOrderResult;

          res.status(200).json(orderResult);
        }
      );
    });
  });
}

function store(req, res) {
  const { date, status, discount_id, videogames } = req.body;

  if (!date || typeof status !== "boolean" || videogames.length === 0) {
    return res.status(400).json({ error: "Invalid request data" });
  }
}
module.exports = { show, store };
