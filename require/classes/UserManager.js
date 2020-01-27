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

    registerUser(user,password,mail,name){
        
        return new Promise(async(resolve,reject)=>{

            let isUserRegistered;
            
            await this.isUserRegistered(user)
                .then(response=>{
                    isUserRegistered = response;
                })
                .catch(err=>{
                    console.log(err);
                    reject(err);
                })

            if(isUserRegistered){
                return reject("User already registered");
            }

            let encriptedPassword = this.generateSaltedPassword(password);

            let params = [
                new SqlParameter("user",user),
                new SqlParameter("password",encriptedPassword.password),
                new SqlParameter("mail",mail),
                new SqlParameter("salt",encriptedPassword.salt),
                new SqlParameter("fullName",name),
            ];

            await this.sqlManager.executeProcedure("RegisterUser",params)
                .then(response=>{
                    resolve(true);
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
                        resolve(response[0]);
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

            let isUserRegistered;

            await this.isUserRegistered(user)
                .then(response=>{                    
                    isUserRegistered = response;
                })
                .catch(err=>{
                    console.log(err);
                    reject(err);
                })
                
            if(!isUserRegistered){
                reject(false);
            }

            let encriptedPassword = this.generateSaltedPassword(password,isUserRegistered.salt);

            resolve(encriptedPassword.password == isUserRegistered.password ? isUserRegistered : false) ;
    
        })
    }

    login(user,password){
        return new Promise(async (resolve,reject)=>{

            let isValidUser;

            await this.isValidUser(user,password)
                .then(response=>{                    
                    isValidUser = response;
                })
                .catch(err=>{
                    console.log(err);
                    reject(err);
                })

            if(!isValidUser){                              
                reject("Incorrect user/password combination");
            }
            console.log(isValidUser)
            await this.tokenManager.generateToken({user,"uid":isValidUser.uid})
                .then(token=>{
                    this.tokenManager.saveToken(token,user,"null")
                    resolve({token,name:isValidUser.FullName,mail:isValidUser.Mail});
                })
                .catch(err=>{
                    console.log(err);
                    reject(err);
                })  
        })
    }

    generateSaltedPassword(password,salt=null){
        
        let encryptedPassword = {
            "salt": salt!=null ? salt : crypto.randomBytes(32).toString('base64'),
            "password":""
        };

        encryptedPassword.password = crypto.createHash('sha256').update(encryptedPassword.salt+password).digest('hex');

        return(encryptedPassword);

    }

}


module.exports = UserManager;