let SqlManager = require('./SqlManager');
let SqlParameter = require('./SqlParameter');
let AppConfig = require('../AppConfig');
let TokenManager = require('./TokenManager');
var crypto = require('crypto');

class UserManager{

    constructor(){
        this.sqlManager = new SqlManager(AppConfig.database.name);
        this.sqlManager.setServer(AppConfig.database.host);
        this.sqlManager.setDbUser(AppConfig.database.user,AppConfig.database.password);
        this.tokenManager = new TokenManager();
    }

    registerUser(user,password,mail){
        
        return new Promise(async(resolve,reject)=>{
            if(await this.isUserRegistered(user)){
                reject("User already registered");
            }

            let encriptedPassword = this.generateSaltedPassword(password);

            let params = [
                new SqlParameter("user",user),
                new SqlParameter("password",encriptedPassword.password),
                new SqlParameter("mail",mail),
                new SqlParameter("salt",encriptedPassword.salt),
            ];

            await this.sqlManager.executeProcedure("RegisterUser",params)
                .then(response=>{
                    resolve(response);
                })
                .catch(err=>{
                    console.log(err);
                    reject(err);
                })
        })

    }

    isUserRegistered(user){
        return new Promise(async (resolve,reject)=>{
            await this.sqlManager.executeProcedure("IsUserAlreadyRegistered",[new SqlParameter("user",user)])
                .then(response=>{
                    if(response.length>0){
                        resolve(true);
                    }
                    resolve(false);
                })
                .catch(err=>{
                    console.log(err);
                    reject(err);
                })
        })
    }

    isValidUser(user,password){
        return new Promise(async(resolve,reject)=>{
            let params = [
                new SqlParameter("user",user),
                new SqlParameter("password",password),
            ]
            await this.sqlManager.executeProcedure("IsUserAlreadyRegistered",params)
                .then(response=>{
                    if(response.length>0){
                        resolve(true);
                    }
                    resolve(false);
                })
                .catch(err=>{
                    console.log(err);
                    reject(err);
                })
        })
    }

    login(user,password){
        return new Promise(async (resolve,reject)=>{
            if(await this.isValidUser(user,password)){
                await this.tokenManager.generateToken({user,password})
                    .then(token=>{
                        this.tokenManager.saveToken(token,user,"null")
                        resolve(token);
                    })
                    .catch(err=>{
                        console.log(err);
                        reject(err);
                    })                
            }
            reject("Incorrect user/password combination");
        })
    }

    generateSaltedPassword(password,salt=null){
        var buf = crypto.randomBytes(16).toString('base64');
    }

}


module.exports = UserManager;