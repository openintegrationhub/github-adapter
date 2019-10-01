/**
 * Copyright 2018 Cloud Ecosystem e.V.
 * 
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

"use strict";
const request = require('request-promise');
const messages = require('elasticio-node').messages;

const clParams = '?client_id=';
const clientId = process.env.CLIENT_ID;
const queryParams = '&access_token=';

const API_BASE_URI = 'https://api.github.com';

exports.process = processTrigger;

/**
 * Executes the trigger's logic by sending a request to the GitHub API and emitting response to the platform.
 * The function returns a Promise sending a request and resolving the response as platform message.
 *
 * @param msg incoming messages which is empty for triggers
 * @param cfg object to retrieve triggers configuration values, such as apiKey and pet status
 * @returns promise resolving a message to be emitted to the platform
 */
async function processTrigger(msg, cfg) {
    const self = this;
    const pullRequests = [];
    const token = cfg.oauth.access_token;
    const appUid = process.env.AppUid;

    console.log('Fetching all repositories...');
    
    // Fetch all repositories that the user belongs to 
    const repos = await getRepos(token);
    
    console.log('Fetching all pull requests...');

    // Fetch all pull request from the previously fetched repositories
    const pullreqs = async () => {
        await asyncForEach(repos, async elem => {
           
            const requestOptions = {
                uri: `${API_BASE_URI}/repos/${elem.owner.login}/${elem.name}/pulls${clParams}${clientId}${queryParams}${token}`,
                json: true,
                headers: {
                    'User-Agent': 'OIH Adapter'
                }
            };

            const temp =  await request.get(requestOptions);

            if (temp && temp.length === 0){
                console.log(`No Pull Requests in repository ${elem.name} by ${elem.owner.login}`);
            } else {
                temp.forEach(element => {
                    pullRequests.push(element);
                });
            }
        });
    }

    await pullreqs();
    
    console.log(`Found %s pull requests`, pullRequests.length);

    const getApplicationUid = {
        uri: `http://component-repository.openintegrationhub.com/components/${process.env.ELASTICIO_COMP_ID}`,
        json: true,
        headers: {
            "Authorization" : `Bearer ${iamToken}`,
            }
    };

    // Make request to Component Repository API
    const applicationUidResponse = await request.get(getApplicationUid);

    /** The following block (L90 - L99) creates the meta object.  
     *  This meta object stores information which are later needed in order to make the hub and spoke architecture work properly
     */
    const appUid = applicationUidResponse.data.applicationUid;

    let meta = {
        applicationUid: (appUid!=undefined && appUid!=null) ? appUid : 'appUid not set yet',
        iamToken: (iamToken!=undefined && iamToken!=null) ? iamToken : 'iamToken not set yet'
    }

    let contentWithMeta;
    
    /** Iterates through all received pull requests and emits each object one-by-one.
     * The contentWithMeta object combines the previously created meta information with the acutal payload.
     * After the unique identifier has been added to the meta object it is removed from the payload to avoid duplicated entries and ensure proper mapping in the subsequent component. 
     * */ 
    if (pullRequests && pullRequests.length>=0){
        pullRequests.forEach(elem =>{

            contentWithMeta = {
                meta,
                data: elem
            };

            self.emit('data', messages.newMessageWithBody(contentWithMeta));
        });
    } else {
        throw new Error('Emitting data failed!');
    }
}

async function getRepos(token){

    const requestOptions = {
        uri: `${API_BASE_URI}/user/repos${clParams}${clientId}${queryParams}${token}`,
        json: true,
        headers: {
            'User-Agent': 'OIH Adapter'
        }
    };

    const repositories = await request.get(requestOptions);

    if (repositories && repositories.length>=0){
        return repositories;
    } else {
        throw new Error('No data received');
    }
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
}