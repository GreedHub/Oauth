/* Dependencias*/ 
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');

/* Configuracion de Express*/
const app = express();
app.use(helmet());
app.use(bodyParser.json());
app.use(morgan('combined'));
const port = 3000;

/* Importacion de modulos de API */
//const StockMovil = require('./exposed_services/stock_movil/main.js'); 

  
app.get("/", (req,res)=>{

  res.send("hola mundo");

});

/* Exposicion en el puerto seleccionado */
  app.listen(port, () => {
    console.log('listening on port '+port);
  });