const connection = require("../data/db");

function index(req, res) {
  // come in vidogames

  const ordersQuery = `
    SELECT * FROM orders
  `;

  const discountsQuery = `
    SELECT * FROM discounts
  `;

  const videogameOrdersQuery = `
    SELECT 
    videogame_order.order_id,
    videogames.id AS videogame_id,
    videogames.name AS videogame_name,
    videogames.price AS videogame_price
    FROM videogame_order
    LEFT JOIN videogames ON videogame_order.videogame_id = videogames.id
    WHERE videogame_order.order_id IN (?)
  `;

  connection.query(ordersQuery, (err, ordersResult) => {
    if (err) return res.status(500).json({ error: "Database query failed" });

    const ids = ordersResult.map((order) => order.id);

    connection.query(discountsQuery, (err, discountsResult) => {
      if (err) return res.status(500).json({ error: "Database query failed" });

      connection.query(
        videogameOrdersQuery,
        [ids],
        (err, videogamesOrderResult) => {
          if (err)
            return res.status(500).json({ error: "Database query failed" });

          const compositeOrder = ordersResult.map((order) => {
            const discount =
              discountsResult.find(
                (discount) => discount.id === order.discount_id
              ) || null;

            const videogames = videogamesOrderResult
              .filter((videogame) => videogame.order_id === order.id)
              .map((videogame) => ({
                id: videogame.videogame_id,
                name: videogame.videogame_name,
                price: videogame.videogame_price,
              }));

            return {
              id: order.id,
              date: order.date,
              status: order.status,
              total_amount: order.total_amount,
              discount: discount,
              videogames: videogames,
            };
          });
          res.status(200).json({ success: true, data: compositeOrder });
        }
      );
    });
  });
}

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

          res.status(200).json({ success: true, data: orderResult });
        }
      );
    });
  });
}

module.exports = { index, show };
