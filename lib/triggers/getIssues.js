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

const API_BASE_URI = 'https://api.github.com';
const clParams = '?client_id=';
const clientId = process.env.CLIENT_ID;
const queryParams = '&access_token=';

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
    // Self is later used to emit messages
    const self = this;  

    // Set iamToken to send requests to the Open Intagration Hub Services
    const iamToken = process.env.ELASTICIO_IAM_TOKEN;

    // Create request options to perform a request to the GitHub API 
    const requestOptions = {
        uri: `${API_BASE_URI}/issues${clParams}${clientId}${queryParams}${token}`,
        json: true,
        headers: {
            'User-Agent': 'OIH Adapter'
        }
    };

    console.log('Fetching all issues...');

    // Make request to GitHub API
    const issues = await request.get(requestOptions);


    // Create request options to request the applicationUid for GitHub from the component repository 
    const getApplicationUid = {
        uri: `http://component-repository.openintegrationhub.com/components/${process.env.ELASTICIO_COMP_ID}`,
        json: true,
        headers: {
            "Authorization" : `Bearer ${iamToken}`,
            }
    };

     // Make request to Component Repository API
    const applicationUidResponse = await request.get(getApplicationUid);

    /** The following block (L71 - L78) creates the meta object.  
     *  This meta object stores information which are later needed in order to make the hub and spoke architecture work properly
     */
    const appUid = applicationUidResponse.data.applicationUid;

    let meta = {
        applicationUid: (appUid!=undefined && appUid!=null) ? appUid : 'appUid not set yet',
        iamToken: (iamToken!=undefined && iamToken!=null) ? iamToken : 'iamToken not set yet'
    }

    let contentWithMeta;
    
    /** Iterates through all received issues and emits each object one-by-one.
     * The contentWithMeta object combines the previously created meta information with the acutal payload.
     * After the unique identifier has been added to the meta object it is removed from the payload to avoid duplicated entries and ensure proper mapping in the subsequent component. 
     * */ 
    if (issues && issues.length>=0){
        issues.forEach(elem =>{
            meta.recordUid = elem.id;
            delete elem.id;
            contentWithMeta = {
                meta,
                data: elem
            };
            self.emit('data', messages.newMessageWithBody(contentWithMeta));
        });
    } else {
        throw new Error('No data received');
    }
}