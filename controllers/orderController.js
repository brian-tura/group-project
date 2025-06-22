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

function preview(req, res) {
  const { discount_id, videogames } = req.body;

  // validation data
  if (!Array.isArray(videogames) || videogames.length === 0) {
    return res.status(400).json({ error: "Invalid request" });
  }
  // validation of videogames quantity
  for (const videogame of videogames) {
    if (!videogame.quantity || videogame.quantity <= 0)
      return res
        .status(400)
        .json({ error: "Invalid videogame data in request" });
  }

  const ids = videogames.map((v) => v.id);

  const orderVideogamesQuery = `
    SELECT *
    FROM videogames
    WHERE id IN (?)
  `;

  connection.query(
    orderVideogamesQuery,
    [ids],
    (err, orderVideogamesResult) => {
      if (err) return res.status(500).json({ error: "Database query failed" });
      if (orderVideogamesResult.length !== ids.length) {
        return res
          .status(404)
          .json({ error: "One or more videogames not found" });
      }

      let total = 0;
      const detailedItems = orderVideogamesResult.map((videogame) => {
        const requested = videogames.find((v) => v.id === videogame.id);
        const pricePerUnit = videogame.offer
          ? videogame.price * (1 - videogame.offer)
          : videogame.price;
        const subtotal = pricePerUnit * requested.quantity;
        total += subtotal;

        return {
          id: videogame.id,
          title: videogame.title,
          quantity: requested.quantity,
          unit_price: pricePerUnit.toFixed(2),
          subtotal: subtotal.toFixed(2),
        };
      });

      res.status(200).json({
        success: true,
        total: total.toFixed(2),
        items: detailedItems,
        discount_id,
      });
    }
  );
}

module.exports = { show, preview };
