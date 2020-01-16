let SqlManager   = require('../classes/SqlManager');
let SqlParameter = require('../classes/SqlParameter');
let AppConfig = require('../AppConfig');


module.exports = ()=>{

    let sql = new SqlManager(AppConfig.database.name);
    sql.setDbUser(AppConfig.database.user,AppConfig.database.password);
    sql.setServer(AppConfig.database.host);

    return {
        getClient:getClient,
        saveAccessToken:saveAccessToken,
    }

}

function getClient(clientID, clientSecret, callback){

    //create the the client out of the given params.
    //It has no functional role in grantTypes of type password
    const client = {
        clientID,
        clientSecret,
        grants: null,
        redirectUris: null
    }

    callback(false, client);
}

function saveAccessToken(accessToken, clientID, expires, user, callback){

    let params = [
        new SqlParameter("accessToken",accessToken),
        new SqlParameter("clientID",clientID),
        new SqlParameter("expires",expires),
        new SqlParameter("user",user)
    ];


    await sql.executeProcedure("saveAccessToken",params)
        .then((response)=>{
            callback(null,response)
        })
        .catch((err)=>{
            console.log(err);
            callback(err)
        })

    
}