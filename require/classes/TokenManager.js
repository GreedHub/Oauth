let SqlManager = require('./SqlManager');
let SqlParameter = require('./SqlParameter');
let AppConfig = require('../AppConfig');
const jwt = require('jsonwebtoken');

class TokenManager{

    constructor(){
        this.sqlManager = new SqlManager(AppConfig.database.name);
        this.sqlManager.setServer(AppConfig.database.host);
        this.sqlManager.setDbUser(AppConfig.database.user,AppConfig.database.password);
        this.secretKey = AppConfig.tokenManager.secretKey;
    }

    saveToken(token,user,ip){
        
        return new Promise(async (resolve,reject)=>{

            let params = [
                new SqlParameter("user",user),
                new SqlParameter("token",token),
                new SqlParameter("ip",ip),
            ];

            await this.sqlManager.executeProcedure("SaveToken",params)
                .then(response=>{
                    resolve(response);
                })
                .catch(err=>{
                    console.log(err);
                    reject(err);
                })
        })

    }

    validateToken(req,res,next){

        const bearerHeader = req.headers['authorization'];
          
        if(!bearerHeader){
          res.sendStatus(403);
          return;
        }
      
        let bearerToken = bearerHeader.split(' ')[1];

        jwt.verify(bearerToken,AppConfig.tokenManager.secretKey,(err,authData)=>{
      
          if(err){
            res.sendStatus(403);
          }
      
          req.authData = authData;
      
          next();
      
        });  
      
      }

    generateToken(user){
        return new Promise((resolve,reject)=>{
            jwt.sign({user},this.secretKey,{expiresIn:'60m'},(err,token)=>{
                
                if(err){
                    console.log(err);
                    reject(err);
                }

                resolve(token);
            });
        });
    }

}


module.exports = TokenManager;