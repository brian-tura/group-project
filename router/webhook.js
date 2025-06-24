const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const connection = require("../data/db");

router.post("/", express.raw({ type: "application/json" }), (req, res) => {
  console.log("🔥 Webhook received, headers:", req.headers);
  console.log("🔥 Raw body:", req.body.toString());
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("✅ Event verified:", event.type);
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    console.log("💳 checkout.session.completed payload:", event.data.object);
    const session = event.data.object;
    const meta = session.metadata;
    const videogames = JSON.parse(meta.videogames);
    const discountCode = meta.discount_code || null;

    // if discount_code → lookup discount.id
    const getDiscountId = (cb) => {
      if (!discountCode) return cb(null, null);
      connection.query(
        `SELECT id FROM discounts WHERE discount_code = ?`,
        [discountCode],
        (e, rows) => cb(e, rows?.[0]?.id ?? null)
      );
    };

    getDiscountId((err, discountId) => {
      if (err) {
        console.error("DB error fetching discount:", err);
        return res.status(500).send("DB error");
      }

      // total_amount- session.amount_total
      const totalAmount = session.amount_total / 100;

      // INSERT orders
      connection.query(
        `INSERT INTO orders (date, status, total_amount, discount_id)
           VALUES (NOW(), true, ?, ?)`,
        [totalAmount, discountId],
        (err, result) => {
          if (err) {
            console.error("DB error inserting order:", err);
            return res.status(500).send("DB error");
          }

          const orderId = result.insertId;
          // INSERT videogame_order
          const values = videogames.map((v) => [orderId, v.id, v.quantity]);
          connection.query(
            `INSERT INTO videogame_order (order_id, videogame_id, quantity)
               VALUES ?`,
            [values],
            (err) => {
              if (err) {
                console.error("DB error inserting items:", err);
                return res.status(500).send("DB error");
              }
              console.log(`✅ Order ${orderId} saved with status=true`);
              res.status(200).send("OK");
            }
          );
        }
      );
    });
  } else {
    console.log(`ℹ️ Event of type ${event.type} ignored`);
    res.status(200).send("Event ignored");
  }
});

module.exports = router;
