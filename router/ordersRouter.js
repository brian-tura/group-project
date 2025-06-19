const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");

router.post("/orders", orderController.store);

router.get("/:id", orderController.show);

module.exports = router;
