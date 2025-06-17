const imagePath = (req, res, next) => {
  req.imagePath = `${req.protocol}://${req.get("host")}/images/videogames`;
  next();
};

module.exports = imagePath;
