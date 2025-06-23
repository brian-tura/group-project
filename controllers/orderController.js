const connection = require("../data/db");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

function show(req, res) {
  const id = req.params.id;

  const orderQuery = `
    SELECT orders.id, orders.date, orders.status, orders.total_amount
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
  const { videogames, discount_code } = req.body;

  if (!Array.isArray(videogames) || videogames.length === 0) {
    return res.status(400).json({ error: "Invalid request" });
  }

  for (const videogame of videogames) {
    if (!videogame.quantity || videogame.quantity <= 0)
      return res
        .status(400)
        .json({ error: "Invalid videogame data in request" });
  }

  const ids = videogames.map((v) => v.id);

  const orderVideogamesQuery = `SELECT * FROM videogames WHERE id IN (?)`;

  connection.query(orderVideogamesQuery, [ids], (err, result) => {
    if (err) return res.status(500).json({ error: "Database query failed" });

    if (result.length !== ids.length) {
      return res
        .status(404)
        .json({ error: "One or more videogames not found" });
    }

    let total = 0;
    const detailedItems = result.map((game) => {
      const requested = videogames.find((v) => v.id === game.id);

      const basePrice = parseFloat(game.price);
      const offer = parseFloat(game.offer) || 0;
      const pricePerUnit = basePrice * (1 - offer);
      const unitSubtotal = pricePerUnit * requested.quantity;
      total += unitSubtotal;

      return {
        id: game.id,
        name: game.name,
        image: req.imagePath + game.image,
        quantity: requested.quantity,
        basePrice: parseFloat(basePrice.toFixed(2)),
        unit_price: parseFloat(pricePerUnit.toFixed(2)),
      };
    });

    if (discount_code) {
      if (typeof discount_code !== "string") {
        return res.status(400).json({ error: "Invalid discount type" });
      }

      const discountQuery = `
        SELECT * FROM discounts
        WHERE discount_code = ? AND (end_date IS NULL OR end_date >= CURDATE()) AND start_date <= CURDATE()
      `;

      connection.query(
        discountQuery,
        [discount_code],
        (err, discountResult) => {
          if (err)
            return res.status(500).json({ error: "Database query failed" });

          if (!discountResult || discountResult.length === 0) {
            return res.status(400).json({ error: "Invalid discount code" });
          }

          const discount = discountResult[0];
          const discountAmount = parseFloat(discount.amount);
          const finalAmount = total * (1 - discountAmount);

          res.status(200).json({
            discount: true,
            discount_code: discount.discount_code,
            discount_value: discountAmount,
            previous_total: parseFloat(total.toFixed(2)),
            discounted_total: parseFloat(finalAmount.toFixed(2)),
            items: detailedItems,
          });
        }
      );
    } else {
      return res.status(200).json({
        success: true,
        total: parseFloat(total.toFixed(2)),
        items: detailedItems,
      });
    }
  });
}

async function pay(req, res) {
  const { videogames, discount_code } = req.body;

  if (!Array.isArray(videogames) || videogames.length === 0) {
    return res.status(400).json({ error: "Invalid request" });
  }

  for (const videogame of videogames) {
    if (!videogame.quantity || videogame.quantity <= 0)
      return res
        .status(400)
        .json({ error: "Invalid videogame data in request" });
  }

  const ids = videogames.map((v) => v.id);
  const query = `SELECT * FROM videogames WHERE id IN (?)`;

  connection.query(query, [ids], async (err, result) => {
    if (err) return res.status(500).json({ error: "Database query failed" });

    if (result.length !== ids.length) {
      return res
        .status(404)
        .json({ error: "One or more videogames not found" });
    }

    let total = 0;
    for (const game of result) {
      const requested = videogames.find((v) => v.id === game.id);
      const basePrice = parseFloat(game.price);
      const offer = parseFloat(game.offer) || 0;
      const price = basePrice * (1 - offer);
      total += price * requested.quantity;
    }

    if (discount_code) {
      const discountQuery = `
        SELECT * FROM discounts
        WHERE discount_code = ? AND (end_date IS NULL OR end_date >= CURDATE()) AND start_date <= CURDATE()
      `;

      connection.query(
        discountQuery,
        [discount_code],
        async (err, discountResult) => {
          if (err)
            return res.status(500).json({ error: "Database query failed" });

          if (!discountResult || discountResult.length === 0) {
            return res.status(400).json({ error: "Invalid discount code" });
          }

          const discount = discountResult[0];
          const discountAmount = parseFloat(discount.amount);
          const discountedTotal = total * (1 - discountAmount);

          const finalLineItem = [
            {
              price_data: {
                currency: "eur",
                product_data: {
                  name: `Acquisto con sconto (${discount.discount_code})`,
                },
                unit_amount: Math.round(discountedTotal * 100),
              },
              quantity: 1,
            },
          ];

          return createStripeSession(finalLineItem, res);
        }
      );
    } else {
      const finalLineItem = [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Acquisto videogiochi`,
            },
            unit_amount: Math.round(total * 100),
          },
          quantity: 1,
        },
      ];

      return createStripeSession(finalLineItem, res);
    }
  });
}

async function createStripeSession(line_items, res) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: "http://localhost:5173/success",
      cancel_url: "http://localhost:5173/cancel",
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Errore durante la creazione della sessione:", err.message);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { show, preview, pay };
