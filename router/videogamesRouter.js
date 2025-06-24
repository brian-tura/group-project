const express = require("express");
const router = express.Router();

const videogameController = require(`../controllers/videogameController.js`);

router.get(`/`, videogameController.index);

router.get(`/:slug`, videogameController.show);

module.exports = router;
