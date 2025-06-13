function notFound (err, req, res, next) {

    res.status(404);
    res.json({
        error: 'Not found',
        message: 'Errore! Pagina non trovata'
    });

    console.log(notFound);
};

module.exports = notFound;