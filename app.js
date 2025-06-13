const express = require('express');

const app = express();

const cors = require('cors')

const port = process.env.SERVER_PORT || 3000;

const errorsHandler = require('./middlewares/errorsHandler')
const notFoundHandler = require('./middlewares/notFound')

app.use(express.json());

app.use(cors({ origine: process.env.FE_APP }))

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('I miei posts')
});

app.use(errorsHandler)
app.use(notFoundHandler)

app.listen(port, () => {
    console.log(`App in ascolto sulla porta ${port}`);
});