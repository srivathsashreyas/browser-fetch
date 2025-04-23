# Overview
This package allows users to initiate a fetch call in the browser and have it's results
made available in your NodeJS program. The primary intention is for web scraping purposes.

## Assumptions
1. You are running google chrome and exposing a remote debugging port
2. You have already navigated to the page from which you want to initiate fetch requests (maybe via a puppeteer script, manually or any other means) 
3. You have your own means to rotate IP addresses and your browser's fingerprint 

## Why this package?
1. When we use clients specifically designed for NodeJS (such as axios, got etc.) to perform web scraping, we must ensure that we already possess the relevant request header information (particularly cookies) to be passed along with the request. Obtaining this information can be particularly tricky when working outside of the browser runtime
2. When using this library, we can initiate a fetch request from the browser and have the results returned to our NodeJS program. This allows us to leverage the browser's capabilities to handle cookies and certain (though not all) other request details automatically. Additionally, since we initiate the request from the browser runtime, the likelihood of being detected (as a bot) is reduced, though there are other factors that can affect this
3. Once you've navigated to the relevant page, you can use this package to initiate multiple requests from this page. This is particularly useful when you want to scrape multiple pieces of information by varying request information (body, query string params etc.). The only requirement is that you have already navigated to the page from which you want to initiate fetch requests 
4. As a bonus this package also allows for cross origin requests by providing the capability to inject CORS headers

## Usage
This package exposes a single method, which uses the following params:
```js
/**
 * @param {string} domain - refers to the domain of the target to which we must attach
 * @param {string} url - refers to the actual url used in the fetch request
 * @param {Object} options - refers to the options used in the fetch request (this follows the same format as the fetch API used in the browser; defined here: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
 * @param {boolean} cors - if true, inject cors headers
 * @param {Array} cors_headers - headers must be specified as an array of objects with each object in the format {name: 'header-name', value: 'header-value'}
 * @param {number} port - refers to the exposed remote debugging port (default 9222)
 * @param {string} targetType - by default, this is a page but could be set to 'iframe','worker' etc. depending on the target type  
 * @returns {object} - an object which either contains a valid response in the format {status:<status>, text:<text>} or an object with an error in the format {error:<error stack>}
 */
```

1. Without CORS:
In this mode the request to google.com is made from google.com (assume that you have already navigated to google.com). No cors headers are injected
```js
import browserFetch from 'browser-fetch';

let res = await browserFetch('google.com', 'https://www.google.com', {});
console.log(res?.text);
console.log(res?.status);
console.log(res?.error);
``` 

2. With CORS (default):
In this mode the request to en.wikipedia.org is made from google.com (assume that you have already navigated to google.com). Default cors headers are injected (Access-Control-Allow-Credentials: true, Access-Control-Allow-Headers: *, Access-Control-Allow-Origin: *)
```js
import browserFetch from 'browser-fetch';

let res = await browserFetch('google.com', 'https://en.wikipedia.org/wiki/India', {}, true);
console.log(res?.text);
console.log(res?.status);
console.log(res?.error);
```

3. With CORS (custom headers):
In this mode the request to en.wikipedia.org is made from google.com (assume that you have already navigated to google.com). Custom cors headers are injected, in this case only Access-Control-Allow-Origin: *
```js 
import browserFetch from 'browser-fetch';

let cors_headers = [
        {
            name: 'Access-Control-Allow-Origin',
            value: '*'
        }
]

let res = await browserFetch('google.com', 'https://en.wikipedia.org/wiki/India', {}, true, cors_headers);
console.log(res?.text);
console.log(res?.status);
console.log(res?.error);
```

4. POST request (with custom CORS):
This example is more for illustrative purposes (possible that some of the header information such as the bearer token, guest token etc. will need to be obtained from a fresh session; potentially via intercepting relevant http calls, which is not in the scope of this package but can be done through many others) to highlight that the request options should match the fetch API options. In this case we make a POST request to api.x.com from x.com 
```js
import browserFetch from 'browser-fetch';

let cors_headers = [
        {
            name: 'Access-Control-Allow-Headers',
            value: '*'
        }
];
let res = await browserFetch('x.com','https://api.x.com/1.1/onboarding/sso_init.json',{
        "headers": {
          "accept": "*/*",
          "accept-language": "en-US,en;q=0.9",
          "authorization": "Bearer <****>",
          "content-type": "application/json",
          "sec-ch-ua": "\"Google Chrome\";v=\"135\", \"Not-A.Brand\";v=\"8\", \"Chromium\";v=\"135\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site",
          "x-client-transaction-id": "<****>",
          "x-guest-token": "<****>",
          "x-twitter-active-user": "yes",
          "x-twitter-client-language": "en"
        },
        "referrer": "https://x.com/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": "{\"provider\":\"apple\"}",
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
},true,cors_headers);
console.log(res?.text);
console.log(res?.status);
console.log(res?.error);
```

## Running Unit Tests
1. Navigate to project root folder
2. npm i (if not done already)
3. npm test

## Acknowledgements 
This library is built using the chrome-remote-interface package. Big thanks to cyrus-and (https://github.com/cyrus-and/chrome-remote-interface). 