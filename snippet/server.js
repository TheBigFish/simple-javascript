'use strict';

import fetch from 'isomorphic-fetch';

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

async function a() {}
// (async function () {
//     console.log('Do some thing, ' + new Date());
//     await sleep(1000);
//     console.log('Do other things, ' + new Date());
// })();


// Will fetch README
fetch('https://raw.githubusercontent.com/katopz/vscode-debug-nodejs-es6/master/README.md')
    .then(function (response) {
        // Something wrong.
        if (response.status >= 400) {
            throw new Error("Bad response from server");
        }
        // Parse response to text
        return response.text();
    })
    .then(function (responseText) {
        // Our README.
        console.log(responseText);
    });