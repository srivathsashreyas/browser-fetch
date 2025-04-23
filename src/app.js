import interceptRequest from "./utils/events.js";
import { returnDomains } from "./utils/utils.js";
/**
 * domain refers to the domain of the target to which we must attach
 * url refers to the actual url used in the fetch request
 * options refers to the options used in the fetch request (this follows the same format as the fetch API used in the browser; defined here: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
 * cors -> if true, inject cors headers
 * cors_headers -> headers must be specified as an array of objects with each object in the following format:
 * {name: 'header-name', value: 'header-value'}
 * port -> refers to the exposed remote debugging port (default 9222)
 * targetType -> by default, this is a page but could be set to 'iframe','worker' etc. depending on the target type 
 * @param {string} domain 
 * @param {string} url 
 * @param {Object} options 
 * @param {boolean} cors 
 * @param {Array} cors_headers 
 * @param {number} port 
 * @param {string} targetType 
 * @returns {object} 
 */
async function browserFetch(domain, url, options = {}, cors = false, cors_headers = [], port = 9222, targetType = 'page') {
    let client;
    try {
        //return domains for the target
        client = await returnDomains(domain, port, targetType);
        const { Runtime } = client;

        if (cors) {
            const { Fetch } = client;
            await Fetch.enable({
                //intercept http requests at the response stage (after the headers are received but before the body is sent)
                patterns: [{
                    requestStage: 'Response'
                }]
            });
            interceptRequest(Fetch, url, cors_headers, (err, body) => {
                if (err) {
                    console.log("Error applying cors headers " + err)
                }
            })
        }

        //setup the fetch expression to be evaluated in the browser context
        const expr = `
        let response, response_text, response_status;
        try{
            response = await fetch('${url}', ${JSON.stringify(options)})
            response_text = await response.text();
            response_status = await response.status;
        } catch (e) {
            response_text = e.stack;
        }
        console.log(response_text);`;

        //evaluate the expression in the browser context and return the response
        const res = await Runtime.evaluate({ expression: expr, replMode: true });
        const resText = await Runtime.evaluate({ expression: 'response_text' });
        const resStatus = await Runtime.evaluate({ expression: 'response_status' });

        const response = {
            status: resStatus?.result?.value || 500,
            text: resText?.result?.value || res,
        };
        return response;
    } catch (e) {
        //return error if any
        return { error: e.stack };
    } finally {
        //close the client connection
        if (client) {
            await client.close();
        }
    }
}

export default browserFetch;