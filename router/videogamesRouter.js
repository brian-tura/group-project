const router = express.Router()

const videogameController = require(`../videogameController.js`)

router.get(`/`, videogameController.index);

router.get(`/:id`, videogameController.show);

module.exports = router;
