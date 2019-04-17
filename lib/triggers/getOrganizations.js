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
    const self = this;
    const token = cfg.oauth.access_token;

    const requestOptions = {
        uri: `${API_BASE_URI}/user/orgs${clParams}${clientId}${queryParams}${token}`,
        json: true,
        headers: {
            'User-Agent': 'OIH Adapter'
        }
    };

    console.log('Fetching all organizations...');
    const organizations = await request.get(requestOptions);

    if (organizations && organizations.length>=0){
        organizations.forEach(elem => {
            self.emit('data', messages.newMessageWithBody(elem));
        });
    } else {
        throw new Error('No data received');
    }
}