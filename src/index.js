const fetch = require('node-fetch')
const urlJoin = require('url-join')

const registerEndpoint = (baseUrl, params)  => {
    const url = urlJoin(baseUrl, '/_starworld/register')

    return fetch(url, {
        method: 'post',
        body: JSON.stringify(params),
        headers: {
            'Content-Type': 'application/json',
        },
    })
}

const clearEndpoint = (baseUrl, params)  => {
    const url = urlJoin(baseUrl, '/_starworld/clear')

    return fetch(url, {
        method: 'post',
        body: JSON.stringify(params),
        headers: {
            'Content-Type': 'application/json',
        },
    })
}

module.exports = {
    registerEndpoint,
    clearEndpoint,
}
