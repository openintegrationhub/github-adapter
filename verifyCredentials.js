"use strict";

const request = require('request-promise');

module.exports = verify;

/**
 * Executes the verification logic by sending a simple to the Petstore API using the provided apiKey.
 * If the request succeeds, we can assume that the apiKey is valid. Otherwise it is not valid.
 *
 * @param credentials object to retrieve apiKey from
 * @param cfg object to retrieve triggers configuration values, such as apiKey and pet status
 * @returns Promise sending HTTP request and resolving its response
 */
function verify(credentials) {

    if (!credentials.oauth || credentials.oauth.error) {
      throw new Error ('receiving token failed');
    }
    
    const token = credentials.oauth.access_token;
    const url = `https://api.github.com/user?=${token}`;
  
    console.log('Verifying credentials...');

    try{
        const response = request.get(url);

        if(response){
            console.log(`User:`);
            console.log(JSON.stringify(response));
            console.log('Verficiation succesful!');
            return true;
        }
        throw new Error ('Verficiation failed!');
    } catch (error) {
        console.log(error);
    }
}