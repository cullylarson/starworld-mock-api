const request = require('supertest')
const {baseUrl, clearEndpoints} = require('../integration/utils')
const {registerEndpoint, clearEndpoint} = require('../../src')

afterEach(clearEndpoints)

test('Can clear an endpoint.', () => {
    return registerEndpoint(baseUrl, {
        endpoint: '/test',
        method: 'GET',
        body: {
            a: 'AAA',
        },
    })
        .then(() => {
            return request(baseUrl).get('/test')
                .expect(200)
                .expect(x => expect(x.body).toEqual({a: 'AAA'}))
        })
        .then(() => clearEndpoint(baseUrl, {method: 'GET', endpoint: '/test'}))
        .then(() => {
            return request(baseUrl).get('/test')
                .expect(404)
        })
})
