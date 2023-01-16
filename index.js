const express = require("express")
const cors = require("cors")
const { application } = require("express")
app.listen(3000, console.log('Servidor arriba!'));


const { buscadorJoyas, conseguirJoyas, prepararHATEOAS } = require('./service/joyeria')


const consulta = async (req, res, next) => {
    const parametros = req.params;;
    const url = req.url;
    console.log(`Hoy ${new Date()}
    Se ha recibido una consulta en la ruta ${url}
    acompañado de los parámetros: `,
        parametros
    );
    return next();
};


app.get('/joyas', consulta, async (req,res) =>{
    try{
        const queryString = req.query;
        const joyas = await conseguirJoyas(queryString);
        const HATEOAS = await prepararHATEOAS(joyas);
        res.json(HATEOAS);
    } catch({code, message}) {
        res.status(code).send(message);
    }
});



app.get('/joyas/filtros', consulta, async(req, res) =>{
    try{
        const queryString = req.query;
        const joyas = await buscadorJoyas(queryString);
        res.json(joyas);
    } catch({code, message}){
        res.status(code).send(message);
    }
    
})