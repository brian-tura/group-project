const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");

router.get("/:id", orderController.show);

router.post("/preview", orderController.preview);
// router.post("/", orderController.store);

router.post("/payments", orderController.pay);

module.exports = router;
