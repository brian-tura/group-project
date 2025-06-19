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

function store(req, res) {
  const { date, status, discount_id, videogames } = req.body;

  // validation data
  if (
    !date ||
    typeof status !== "boolean" ||
    !Array.isArray(videogames) ||
    videogames.length === 0
  ) {
    return res.status(400).json({ error: "Invalid request" });
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
        return res.status(400).json({ error: "Some videogames not found" });
      }

      let totalAmount = orderVideogamesResult.reduce((total, videogame) => {
        return total + Number(videogame.price);
      }, 0);

      console.log("amount before discount:", totalAmount);

      // function to complete order
      const completeOrder = (finalAmount, discountId = null) => {
        const insertOrderQuery = `
        INSERT INTO orders (date, status, total_amount, discount_id)
        VALUES (?, ?, ?, ?)
      `;

        connection.query(
          insertOrderQuery,
          [date, status, finalAmount.toFixed(2), discountId],
          (err, orderInsertResult) => {
            if (err) {
              console.error("Error inserting order:", err);
              return res.status(500).json({ error: "Failed to create order" });
            }

            const orderId = orderInsertResult.insertId;

            // prepear videogame_order association
            const videogameOrderData = ids.map((videogameId) => [
              videogameId,
              orderId,
              1,
            ]);

            // insert videogame_order association
            const insertVideogameOrderQuery = `
            INSERT INTO videogame_order (videogame_id, order_id, quantity)
            VALUES ?
          `;

            connection.query(
              insertVideogameOrderQuery,
              [videogameOrderData],
              (err, videogameOrderResult) => {
                if (err) {
                  console.error("Error inserting videogame orders:", err);
                  return res.status(500).json({
                    error: "Failed to associate videogames with order",
                  });
                }

                // return created order
                res.status(201).json({
                  message: "Order created successfully",
                  order: {
                    id: orderId,
                    date: date,
                    status: status,
                    total_amount: finalAmount.toFixed(2),
                    discount_id: discountId,
                    videogames: orderVideogamesResult.map((v) => ({
                      id: v.id,
                      name: v.name,
                      price: v.price,
                    })),
                  },
                });
              }
            );
          }
        );
      };

      // if discount_id -> apply
      if (discount_id) {
        const discountQuery = `
        SELECT *
        FROM discounts
        WHERE id = ? AND (end_date IS NULL OR end_date >= CURDATE()) AND start_date <= CURDATE()
      `;

        connection.query(
          discountQuery,
          [discount_id],
          (err, discountResult) => {
            if (err) {
              console.error("Error querying discount:", err);
              return res.status(500).json({ error: "Database query failed" });
            }

            if (discountResult.length === 0) {
              return res
                .status(400)
                .json({ error: "Invalid or expired discount code" });
            }

            const discount = discountResult[0];
            const discountAmount = Number(discount.amount);

            // apply discount
            const finalAmount = totalAmount * (1 - discountAmount);

            console.log("discount: ", discountAmount * 100 + "%");
            console.log("final amount: ", finalAmount);

            completeOrder(finalAmount, discount_id);
          }
        );
      } else {
        // if !discount -> base total
        completeOrder(totalAmount);
      }
    }
  );
}

module.exports = { show, store };
