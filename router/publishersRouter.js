const express = require("express");
const router = express.Router();

const publisherController = require("../controllers/publisherController");

router.get("/", publisherController.index);

module.exports = router;
