/* Dependencias*/ 
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const TokenManager = require('./require/classes/TokenManager');
const UserManager = require('./require/classes/UserManager');
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

app.post("/register", (req,res)=>{

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

  if(!req.body.mail){
    res.json({
      status:400,
      message:'mail not recived'
    })
    return;
  }

  userManager.registerUser(req.body.user,req.body.password,req.body.mail)
    .then(token=>{
      res.json(token);
    })
    .catch(err=>{
      console.log(err);
      res.json({
        status:401,
        message:err
      })
    })

});

/* Exposicion en el puerto seleccionado */
  app.listen(port, () => {
    console.log('listening on port '+port);
  });