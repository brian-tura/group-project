const express = require("express");
const router = express.Router();

const videogameController = require(`../controllers/videogameController.js`);

router.get(`/`, videogameController.index);

router.get("/search", videogameController.search);

router.get(`/:id`, videogameController.show);

module.exports = router;
