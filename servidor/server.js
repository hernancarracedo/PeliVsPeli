//dependencias necesarias para el proyecto
const express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var controller = require('../servidor/controladores/controller');

var app = express();

app.use(cors());

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.get('/competencias/:id', controller.getCompetencia);
app.get('/competencias', controller.getCompetencias);
app.get('/competencias/:id/peliculas', controller.getContrincantes);
app.post('/competencias/:idCompetencia/voto', controller.guardarVoto);
app.get('/competencias/:id/resultados', controller.getResultados);
app.post('/competencias', controller.guardarCompetencia);
app.delete('/competencias/:id/votos', controller.borrarVotos);
app.get('/generos', controller.getGeneros);
app.get('/directores', controller.getDirectores);
app.get('/actores', controller.getActores);
app.delete('/competencias/:id', controller.borrarCompetencia);

//seteamos el puerto en el cual va a escuchar los pedidos la aplicación
var puerto = '8080';

app.listen(puerto, function () {
  console.log( "Escuchando en el puerto " + puerto );
});
        

/*
app.get('/peliculas/recomendacion', controller.getRecomendacion);
app.get('/peliculas', controller.getPeliculas);
app.get('/generos', controller.getGeneros);
app.get('/peliculas/:id', controller.getPelicula);
*/