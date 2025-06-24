const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const connection = require("../data/db");
const nodemailer = require("nodemailer");

router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    console.log("webhook received, headers:", req.headers);
    console.log("raw body:", req.body.toString());

    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log("event verified:", event.type);
    } catch (err) {
      console.error("webhook signature error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log("checkout.session.completed payload:", session);

      const meta = session.metadata;
      let videogames;
      try {
        videogames = JSON.parse(meta.videogames);
      } catch (e) {
        console.error("Error parsing videogames metadata:", e);
        return res.status(400).send("Invalid videogames metadata");
      }
      const discountCode = meta.discount_code || null;
      const totalAmount = session.amount_total / 100;

      const getDiscountId = (cb) => {
        if (!discountCode) return cb(null, null);
        connection.query(
          `SELECT id FROM discounts WHERE discount_code = ?`,
          [discountCode],
          (err, rows) => {
            if (err) return cb(err);
            cb(null, rows.length ? rows[0].id : null);
          }
        );
      };

      getDiscountId((err, discountId) => {
        if (err) {
          console.error("DB error fetching discount:", err);
          return res.status(500).send("DB error");
        }

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

            const videogameIds = videogames.map((v) => v.id);

            connection.query(
              `SELECT id, name, price FROM videogames WHERE id IN (?)`,
              [videogameIds],
              async (err, games) => {
                if (err) {
                  console.error("DB error fetching videogames:", err);
                  return res.status(500).send("DB error");
                }

                const detailedVideogames = videogames.map((v) => {
                  const game = games.find((g) => g.id === v.id);
                  return {
                    ...v,
                    name: game ? game.name : "Nome non disponibile",
                    price: game ? parseFloat(game.price) : 0,
                  };
                });

                const values = detailedVideogames.map((v) => [
                  orderId,
                  v.id,
                  v.quantity,
                ]);

                connection.query(
                  `INSERT INTO videogame_order (order_id, videogame_id, quantity)
                   VALUES ?`,
                  [values],
                  async (err) => {
                    if (err) {
                      console.error("DB error inserting items:", err);
                      return res.status(500).send("DB error");
                    }

                    console.log(`order ${orderId} saved with status=true`);

                    const transporter = nodemailer.createTransport({
                      host: "smtp.ethereal.email",
                      port: 587,
                      auth: {
                        user: process.env.ETHEREAL_USER,
                        pass: process.env.ETHEREAL_PASS,
                      },
                    });

                    const orderHtml = detailedVideogames
                      .map(
                        (v) => `
                        <tr>
                          <td>${v.name}</td>
                          <td>${v.quantity}</td>
                        </tr>`
                      )
                      .join("");

                    const htmlContent = `
                      <h1>Ecco il riepilogo del tuo ordine:</h1>
                      <p><strong>ID ordine:</strong> ${orderId}</p>
                      <table border="1" cellpadding="8" cellspacing="0">
                        <thead>
                          <tr>
                            <th>Videogioco</th>
                            <th>Quantità</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${orderHtml}
                        </tbody>
                      </table>
                      <p style="font-size: 32px;"><strong>Totale ordine:</strong> €${totalAmount.toFixed(
                        2
                      )}</p>
                    `;

                    const mailOptions = {
                      from: `"Boogaming" <${process.env.ETHEREAL_USER}>`,
                      to: process.env.EMAIL_TO,
                      subject: `Nuovo ordine #${orderId} ricevuto`,
                      text: `Hai ricevuto un nuovo ordine (ID: ${orderId}) per un totale di €${totalAmount.toFixed(
                        2
                      )}.`,
                      html: htmlContent,
                    };

                    try {
                      const info = await transporter.sendMail(mailOptions);
                      console.log(
                        `✉️ Email inviata: ${nodemailer.getTestMessageUrl(
                          info
                        )}`
                      );
                    } catch (emailErr) {
                      console.error("send mail error:", emailErr);
                    }

                    res.status(200).send("OK");
                  }
                );
              }
            );
          }
        );
      });
    } else {
      console.log(`event of type ${event.type} ignored`);
      res.status(200).send("Event ignored");
    }
  }
);

module.exports = router;
