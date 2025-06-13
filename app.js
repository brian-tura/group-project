const express = require('express');

const app = express();

const port = 3000;

const errorsHandler = require('./middlewares/errorsHandler')
const notFoundHandler = require('./middlewares/notFound')

app.use(express.json());

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('I miei posts')
});

app.listen(port, () => {
    console.log(`App in ascolto sulla porta ${port}`);
});