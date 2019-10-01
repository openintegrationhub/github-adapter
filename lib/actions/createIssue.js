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
exports.process = processAction;
/**
 * Executes the action's logic by sending a request to the GitHub API and emitting response to the platform.
 * The function returns a Promise sending a request and resolving the response as platform message.
 *
 * @param msg incoming messages which is empty for triggers
 * @param cfg object to retrieve triggers configuration values, such as apiKey and pet status
 * @returns promise resolving a message to be emitted to the platform
 */
function processAction(msg, cfg) {
    const clParams = '?client_id=';
    const clientId = process.env.CLIENT_ID;
    const queryParams = '&access_token=';
    const token = cfg.oauth.access_token;
    const self = this;
    const iamToken = process.env.ELASTICIO_IAM_TOKEN;
    const oihUid = (msg.body.meta!=undefined && msg.body.meta.oihUidEncrypted!= undefined) ? msg.body.meta.oihUidEncrypted : 'oihUidEncrypted not set yet'
    
    // Check if issue title is set
    if (!msg.body.title) {
        throw new Error('Title is required');
    }
    
    // Create request options to send request to GitHub API
    const requestOptions = {
        uri: `${API_BASE_URI}/repos/${msg.body.owner}/${msg.body.repository}/issues${clParams}${clientId}${queryParams}${token}`,
        headers: {
            'User-Agent': 'OIH Adapter'
        },
        body: msg.body,
        json: true
    };
    
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

    /** The following block (L60 - L69) creates the meta object.  
     *  This meta object stores information which are later needed in order to make the hub and spoke architecture work properly
     */
    const appUid = applicationUidResponse.data.applicationUid;

    console.log('About to create a new issue...');

    let meta ={
        applicationUid: (appUid!=undefined && appUid!=null) ? appUid : 'appUid not set yet',
        oihUidEncrypted: oihUid
    };
    
    /** Makes a request to the GitHub API, merges the meta object with the received data from GitHub and emits the new message. 
     *  The uid is stored in the meta object and is afterwards removed from the response object from GitHub.
     */
    request.post(requestOptions).then((res) => {
      meta.recordUid = res.id;
      delete res.id;
      
      const contentWithMeta = {
          meta,
          data: res
      };
      self.emit('data', messages.newMessageWithBody(contentWithMeta));
    });
    
}