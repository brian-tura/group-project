function errorsHandler(err,req,res,next){
    res.status(500);
    res.json({
        error:("Errore interno al server"),
        message: err.message
    });
}

module.exports = errorsHandler