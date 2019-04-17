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

    if (!msg.body.title) {
        throw new Error('Title is required');
    }

    const requestOptions = {
        uri: `${API_BASE_URI}/repos/${msg.body.owner}/${msg.body.repository}/issues${clParams}${clientId}${queryParams}${token}`,
        headers: {
            'User-Agent': 'OIH Adapter'
        },
        body: msg.body,
        json: true
    };

    console.log('About to create a new pull request...');

    // return the promise that sends a request to the Petstore API
    return request.post(requestOptions)
        .then((response) => messages.newMessageWithBody(response));
}