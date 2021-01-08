const request = require('supertest')
const {curry, get, liftA} = require('@cullylarson/f')

const baseUrl = `http://localhost:${process.env.PORT}`

// can be passed to request.expect. will check if field present in response body and is not empty
const hasField = curry((fieldName, res) => {
    if(!get(fieldName, undefined, res.body)) throw Error(`Did not find field [${fieldName}] in response body.`)
})

// can be passed to request. checks of field is present and set to the provided value
const matchesField = curry((fieldName, fieldValue, res) => {
    const foundValue = get(liftA(fieldName), undefined, res.body)
    if(foundValue !== fieldValue) throw Error(`Field [${fieldName}] does not match [${fieldValue}] in response body. Found [${foundValue}].`)
})

const registerEndpoint = params => request(baseUrl)
    .post('/_starworld/register')
    .send(params)

const clearEndpoints = () => request(baseUrl)
    .delete('/_starworld/clear')
    .send({})

module.exports = {
    baseUrl,
    hasField,
    matchesField,
    registerEndpoint,
    clearEndpoints,
}
