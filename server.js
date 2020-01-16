/* Dependencias*/ 
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const TokenManager = require('./require/classes/TokenManager');
const UserManager = require('./require/classes/UserManager');
var crypto = require('crypto')
/* const oauth2 = require('simple-oauth2').create(credentials); */

/* Configuracion de Express*/
const app = express();
app.use(helmet());
app.use(bodyParser.json());
app.use(morgan('combined'));

/* App Constants */
const port = 3000;
const tokenManager = new TokenManager();
const userManager = new UserManager();

/* Importacion de modulos de API */
//const StockMovil = require('./exposed_services/stock_movil/main.js'); 
 
app.get("/resource", tokenManager.validateToken, (req,res)=>{

  res.json(req.authData);

});

app.post("/login", (req,res)=>{

  if(!req.body.user){
    res.json({
      status:400,
      message:'user not recived'
    })
    return;
  }

  if(!req.body.password){
    res.json({
      status:400,
      message:'password not recived'
    })
    return;
  }

  userManager.login(req.body.user,req.body.password)
    .then(token=>{
      res.json(token);
    })
    .catch(err=>{
      console.log(err);
      res.json({
        status:401,
        message:'user or password error'
      })
    })

});

/* Exposicion en el puerto seleccionado */
  app.listen(port, () => {
    console.log(crypto.randomBytes(16).toString('hex'));
    console.log('listening on port '+port);
  });