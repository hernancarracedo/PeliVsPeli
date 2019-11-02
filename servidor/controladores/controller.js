let conex = require('../lib/conexionbd.js');

function getCompetencias(req, res){
    sql = "select * FROM competencia";
    conex.query(sql, function(error, result, fields){
        if (error) {
            console.log("Ha ocurrido un error en la consulta", error.message);
            return res.status(404).send("Ha ocurrido un error en la consulta");
        } else {
            res.send(JSON.stringify(result));
        } 
    });
}

function getContrincantes(req, res){
    let id = req.params.id;
    sql = "SELECT * FROM competencia WHERE id = "+ id;
    conex.query(sql, function(error, resultCompe, fields){
        if (resultCompe.length == 0) {
            return res.status(404).send("La competencia indicada no existe"); 
        } else {
            var filtros = [];

            if (resultCompe[0].genero_id !== null) {
                filtros.push("genero_id = "+ resultCompe[0].genero_id);
            }
   
            if (resultCompe[0].director_id !== null){
               filtros.push("director_id = " + resultCompe[0].director_id);
            }
    
            if (resultCompe[0].actor_id !== null){
                 filtros.push("actor_id = "+ resultCompe[0].actor_id);
            }


            sql = `SELECT * FROM pelicula AS pel  
            left join director_pelicula AS dp ON dp.pelicula_id = pel.id
            left join actor_pelicula AS ac ON ac.pelicula_id = pel.id`

            if (filtros.length > 0) {
                sql = sql + " WHERE ";
            }

            for (var i=0; i<filtros.length; i++) { 
                sql = sql + filtros[i];
                if (i+1 !== filtros.length){ // chequeo si quedan mas filtros para aplicar y agrego un "and "
                    sql = sql + ' AND ';
                }
            }

            sql = sql + " ORDER BY RAND() LIMIT 2";

            //console.log("la consulta queda: " + sql);

            //sql = "SELECT * FROM pelicula ORDER BY RAND() LIMIT 2";
            conex.query(sql, function(error, result, fields){
                if (error) {
                    console.log("Ha ocurrido un error en la consulta", error.message);
                    return res.status(404).send("Ha ocurrido un error en la consulta");
                } else {
                    var response = {
                        peliculas : result
                    }
                    //console.log(response);
                    res.send(JSON.stringify(response));
                } 
            });
        }
    });
}

function guardarVoto(req, res){
    let idCompetencia = req.params.idCompetencia;
    let idPelicula = req.body.idPelicula;

    //console.log(idPelicula);
    //console.log(idCompetencia);

    sql = "INSERT INTO voto (competencia_id, pelicula_id) VALUES ("+idCompetencia+", "+idPelicula+")";
    //console.log('la consulta de insert queda: '+ sql);
    conex.query(sql, function(error, result, fields){
        if (error) {
            console.log("Ha ocurrido un error en la consulta", error.message);
            return res.status(404).send("Ha ocurrido un error en la consulta");
        } else {
            res.send(JSON.stringify(result));
        } 
    });
}


function getResultados(req, res){
    let idCompetencia = req.params.id;
    //let idPelicula = req.body.idPelicula;
    sql = "select nombre FROM competencia WHERE id = " + idCompetencia;
    conex.query(sql, function(error, resultadoCompe, fields){
        if (resultadoCompe.length == 0) {
            return res.status(404).send("La competencia indicada no existe"); 
        } else {
            sql = `SELECT pelicula_id, pelicula.poster, pelicula.titulo, count(voto.id) as votos FROM voto
            LEFT JOIN pelicula on pelicula.id = voto.pelicula_id
            WHERE competencia_id = `+ idCompetencia +`
            GROUP BY competencia_id, pelicula_id, poster, titulo
            ORDER BY votos DESC`;
            conex.query(sql, function(error, resultados, fields){
                if (error) {
                    console.log("Ha ocurrido un error en la consulta", error.message);
                    return res.status(404).send("Ha ocurrido un error en la consulta");
                }
        
                var response = {
                    competencia : resultadoCompe[0].nombre,
                    resultados : resultados
                }
                //console.log(response);
                res.send(JSON.stringify(response));
            });
        }
    });
}

function guardarCompetencia(req, res){
    //let idCompetencia = req.params.idCompetencia;
    let nombreCompetencia = req.body.nombre;
    let generoCompetencia = req.body.genero;
    let directorCompetencia = req.body.director;
    let actorCompetencia = req.body.actor;

    var campos = [];
    var valores = [];

    if (req.body.nombre !== undefined) {
        campos.push("nombre");
        valores.push('"'+req.body.nombre+'"');
    }

    if (req.body.genero > 0){
        campos.push("genero_id");
        valores.push(req.body.genero);
    }

    if (req.body.director > 0){
        campos.push("director_id");
        valores.push(req.body.director);        
    }

    if (req.body.actor > 0){
        campos.push("actor_id");
        valores.push(req.body.actor);            
    }

    sqlInsertar = "INSERT INTO competencia (";
    for (var i=0; i<campos.length; i++) { 
        sqlInsertar = sqlInsertar + campos[i];
        if (i+1 !== campos.length){ // chequeo si quedan mas campos para insertar y agrego una ", "
            sqlInsertar = sqlInsertar + ', ';
        }
    }
    sqlInsertar = sqlInsertar + ") VALUES (";
    for (var i=0; i<valores.length; i++) { 
        sqlInsertar = sqlInsertar + valores[i];
        if (i+1 !== valores.length){ // chequeo si quedan mas valores para insertar y agrego una ", "
            sqlInsertar = sqlInsertar + ', ';
        }        
    }
    sqlInsertar = sqlInsertar + ");";

    //console.log("la consulta queda: " + sqlInsertar);

    sql = "SELECT * FROM competencia WHERE nombre = '"+ nombreCompetencia+"'";
    conex.query(sql, function(error, resultCompe, fields){
        if (resultCompe.length > 0) {
            return res.status(422).send("La competencia indicada YA EXISTE"); 
        } else {
            //sql = "INSERT INTO competencia (nombre) VALUES ('"+nombreCompetencia+"')";
            conex.query(sqlInsertar, function(error, result, fields){
                if (error) {
                    return res.status(404).send("Ha ocurrido un error en la consulta");
                } 
            });
        }
    });

    //console.log("el id de la competencia es: "+nombreCompetencia);
    //console.log("el genero de la competencia es: "+generoCompetencia);
    //console.log("el director de la competencia es: "+directorCompetencia);
    //console.log("el actor/actriz de la competencia es: "+actorCompetencia);    
}


function borrarVotos(req, res){
    let idCompetencia = req.params.id;

    //sql = "select nombre FROM competencia WHERE id = " + idCompetencia;    
    sql = "select nombre FROM competencia WHERE id = " + idCompetencia;
    conex.query(sql, function(error, resultadoCompe, fields){
        if (resultadoCompe.length == 0) {
            return res.status(404).send("La competencia indicada no existe"); 
        } else {
            sql = "DELETE FROM voto WHERE competencia_id = "+idCompetencia;
            conex.query(sql, function(error, result, fields){
                if (error) {
                    console.log("Ha ocurrido un error en la consulta", error.message);
                    return res.status(404).send("Ha ocurrido un error en la consulta");
                } 
                res.send(JSON.stringify(result));
            });
        }
    });
}

function getGeneros(req, res){
    sql = "select * FROM genero";
    conex.query(sql, function(error, result, fields){
        if (error) {
            console.log("Ha ocurrido un error en la consulta", error.message);
            return res.status(404).send("Ha ocurrido un error en la consulta");
        } else {
            res.send(JSON.stringify(result));
        } 
    });
}

function getDirectores(req, res){
    sql = "select * FROM director";
    conex.query(sql, function(error, result, fields){
        if (error) {
            console.log("Ha ocurrido un error en la consulta", error.message);
            return res.status(404).send("Ha ocurrido un error en la consulta");
        } else {
            res.send(JSON.stringify(result));
        } 
    });
}

function getActores(req, res){
    sql = "select * FROM actor";
    conex.query(sql, function(error, result, fields){
        if (error) {
            console.log("Ha ocurrido un error en la consulta", error.message);
            return res.status(404).send("Ha ocurrido un error en la consulta");
        } else {
            res.send(JSON.stringify(result));
        } 
    });
}


function borrarCompetencia(req, res){
    let idCompetencia = req.params.id;

    //sql = "select nombre FROM competencia WHERE id = " + idCompetencia;    
    sql = "select nombre FROM competencia WHERE id = " + idCompetencia;
    conex.query(sql, function(error, resultadoCompe, fields){
        if (resultadoCompe.length == 0) {
            return res.status(404).send("La competencia indicada no existe"); 
        } else {
            sql = "DELETE FROM voto WHERE competencia_id = "+idCompetencia;
            conex.query(sql, function(error, result, fields){
                if (error) {
                    console.log("Ha ocurrido un error en la consulta", error.message);
                    return res.status(404).send("Ha ocurrido un error en la consulta");
                } 

                sql = "DELETE FROM competencia WHERE id = "+idCompetencia;
                conex.query(sql, function(error, result, fields){
                    if (error) {
                        console.log("Ha ocurrido un error en la consulta", error.message);
                        return res.status(404).send("Ha ocurrido un error en la consulta");
                    } 
                    return res.status(200).send("Competencia eliminada con exito");
                });

            });
        }
    });
}


function modificarCompetencia(req, res){
    let idCompetencia = req.params.id;
    let nombreCompetencia = req.body.nombre;

    sql = "select nombre FROM competencia WHERE id = " + idCompetencia;
    conex.query(sql, function(error, resultadoCompe, fields){
        if (resultadoCompe.length == 0) {
            return res.status(404).send("La competencia indicada no existe"); 
        } else {
            sql = `UPDATE competencia SET nombre = '`+nombreCompetencia+`' WHERE id =`+idCompetencia;
            conex.query(sql, function(error, result, fields){
                if (error) {
                    console.log("Ha ocurrido un error en la consulta", error.message);
                    return res.status(404).send("Ha ocurrido un error en la consulta");
                } 
                return res.status(200).send("Competencia editada correctamente");
            });
        }
    });
}

function getCompetencia(req, res){
    let idCompetencia = req.params.id;
    //console.log(idCompetencia)
    sql = `select competencia.nombre, actor.nombre as actor_nombre, director.nombre as director_nombre, genero.nombre as genero_nombre FROM competencia left join actor on actor.id = competencia.actor_id left join genero on genero.id = competencia.genero_id left join director on director.id = competencia.director_id WHERE competencia.id = ` + idCompetencia;
    conex.query(sql, function(error, resultado, fields){
        if (resultado.length == 0) {
            return res.status(404).send("La competencia indicada no existe"); 
        } else {
            res.send(JSON.stringify(resultado[0]));
        }
    });
}



module.exports = {
    getCompetencias,
    getContrincantes,
    guardarVoto,
    getResultados,
    guardarCompetencia,
    borrarVotos,
    getGeneros,
    getDirectores,
    getActores,
    borrarCompetencia,
    modificarCompetencia,
    getCompetencia
};
