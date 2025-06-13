const express = require('express');

const app = express();

const port = 3000;

app.use(express.json());

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('I miei posts')
})

app.listen(port, () => {
    console.log(`App in ascolto sulla porta ${port}`);
});