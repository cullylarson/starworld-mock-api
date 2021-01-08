const request = require('supertest')
const {baseUrl, matchesField, clearEndpoints} = require('../integration/utils')
const {registerEndpoint} = require('../../src')

afterEach(clearEndpoints)

test('Can register a GET endpoint that returns JSON', () => {
    return registerEndpoint(baseUrl, {
        endpoint: '/test',
        body: {
            a: 'AAA',
            b: 'BBB',
        },
    })
        .then(() => {
            return request(baseUrl).get('/test')
                .expect(200)
                .expect(matchesField('a', 'AAA'))
                .expect(matchesField('b', 'BBB'))
        })
})
