const express = require('express');

const app = express();

const imagePathMiddleware = require('./middlewares/imagePath')

const cors = require('cors');

const port = process.env.SERVER_PORT || 3000;

const videogamesRouter = require('./router/videogamesRouter');

const errorsHandler = require('./middlewares/errorsHandler');
const notFoundHandler = require('./middlewares/notFound');

app.use(express.json());

app.use(cors({ origine: process.env.FE_APP }));

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('I miei videogiochi')
});

app.use('/api/videogames', videogamesRouter);

app.use(imagePathMiddleware)

app.use(errorsHandler);
app.use(notFoundHandler);

app.listen(port, () => {
    console.log(`App in ascolto sulla porta ${port}`);
});