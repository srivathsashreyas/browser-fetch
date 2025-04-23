function interceptRequest(Fetch, url, cors_headers, callback) {
    Fetch.requestPaused(async ({ requestId, request, responseHeaders, responseStatusCode }) => {
        //if the request url matches the specified url
        //intercept and add cors related response headers before allowing the response to be loaded
        if (request.url.includes(url)) {
            if (!responseHeaders) {
                responseHeaders = [];
            }
            
            //if custom cors_headers are provided, use those
            //else specify defaults access-control-allow-origin, access-control-allow-headers and access-control-allow-credentials
            if (cors_headers.length > 0) {
                cors_headers.forEach(header => {
                    responseHeaders.push({
                        name: header.name,
                        value: header.value
                    });
                });
            } else {
                responseHeaders.push({
                    name: 'Access-Control-Allow-Credentials',
                    value: 'true'
                })
                responseHeaders.push({
                    name: 'Access-Control-Allow-Headers',
                    value: '*'
                });
                responseHeaders.push({
                    name: 'Access-Control-Allow-Origin',
                    value: '*'
                })
            }

            let modifiedResponseHeaders = responseHeaders;
            try {
                await Fetch.fulfillRequest({
                    requestId: requestId,
                    responseCode: responseStatusCode ?? 200,
                    responseHeaders: modifiedResponseHeaders
                })
            } catch (e) {
                callback(e, null);
            }
        }
        else {
            try {
                await Fetch.continueRequest({ requestId });
            }
            catch (e) {
                callback(e, null);
            }
        }
    });
}

export default interceptRequest;