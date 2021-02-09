const request = require('supertest')
const {filter} = require('@cullylarson/f')
const {baseUrl, matchesField, registerEndpoint, clearEndpoints} = require('./utils')

afterEach(clearEndpoints)

test('Can register a GET endpoint that returns JSON.', () => {
    return registerEndpoint({
        endpoint: '/test',
        body: {
            a: 'AAA',
            b: 'BBB',
        },
    })
        .expect(200)
        .then(() => {
            return request(baseUrl).get('/test')
                .expect(200)
                .expect(matchesField('a', 'AAA'))
                .expect(matchesField('b', 'BBB'))
        })
})

test('Can register a POST endpoint that returns JSON.', () => {
    return registerEndpoint({
        endpoint: '/blah/another',
        method: 'POST',
        body: {
            c: 'CCC',
            d: 'DDD',
        },
    })
        .expect(200)
        .then(() => {
            return request(baseUrl).post('/blah/another')
                .expect(200)
                .expect(matchesField('c', 'CCC'))
                .expect(matchesField('d', 'DDD'))
        })
})

test('Can register a POST endpoint that returns custom status.', () => {
    return registerEndpoint({
        endpoint: '/hoop/dreams/foryou',
        method: 'POST',
        status: 220,
        body: {
            c: 'CCC',
            d: 'DDD',
        },
    })
        .expect(200)
        .then(() => {
            return request(baseUrl).post('/hoop/dreams/foryou')
                .expect(220)
                .expect(matchesField('c', 'CCC'))
                .expect(matchesField('d', 'DDD'))
        })
})

test('Can register a DELETE endpoint with raw response data.', () => {
    return registerEndpoint({
        endpoint: '/test',
        method: 'DELETE',
        status: 220,
        respondRaw: true,
        body: 'the response',
    })
        .expect(200)
        .then(() => {
            return request(baseUrl).delete('/test')
                .expect(220)
                .expect(x => expect(x.text).toBe('the response'))
        })
})

test('Can register a GET endpoint with custom headers.', () => {
    return registerEndpoint({
        endpoint: '/test',
        method: 'GET',
        headers: {'my-test': 'is good'},
        body: {},
    })
        .expect(200)
        .then(() => {
            return request(baseUrl).get('/test')
                .expect(200)
                .expect(x => expect(filter((_, key) => key === 'my-test', x.headers)).toEqual({'my-test': 'is good'}))
        })
})

test('Can overwrite another endpoint.', () => {
    return registerEndpoint({
        endpoint: '/test',
        method: 'GET',
        body: {
            a: 'AAA',
        },
    })
        .expect(200)
        .then(() => {
            return request(baseUrl).get('/test')
                .expect(200)
                .expect(x => expect(x.body).toEqual({a: 'AAA'}))
        })
        .then(() => {
            return registerEndpoint({
                endpoint: '/test',
                method: 'GET',
                body: {
                    b: 'BBB',
                },
            })
                .expect(200)
        })
        .then(() => {
            return request(baseUrl).get('/test')
                .expect(200)
                .expect(x => expect(x.body).toEqual({b: 'BBB'}))
        })
})

test('Can clear an endpoint.', () => {
    return registerEndpoint({
        endpoint: '/test',
        method: 'GET',
        body: {
            a: 'AAA',
        },
    })
        .expect(200)
        .then(() => {
            return request(baseUrl).get('/test')
                .expect(200)
                .expect(x => expect(x.body).toEqual({a: 'AAA'}))
        })
        .then(() => {
            return request(baseUrl)
                .post('/_starworld/clear')
                .send({method: 'GET', endpoint: '/test'})
                .expect(200)
        })
        .then(() => {
            return request(baseUrl).get('/test')
                .expect(404)
        })
})

test('Can clear all endpoints.', () => {
    return Promise.all([
        registerEndpoint({
            endpoint: '/test',
            method: 'GET',
            body: {
                a: 'AAA',
            },
        })
            .expect(200),
        registerEndpoint({
            endpoint: '/test2',
            method: 'POST',
            body: {
                b: 'BBB',
            },
        })
            .expect(200),
    ])
        .then(() => {
            return request(baseUrl).get('/test')
                .expect(200)
                .expect(x => expect(x.body).toEqual({a: 'AAA'}))
        })
        .then(() => {
            return request(baseUrl).post('/test2')
                .expect(200)
                .expect(x => expect(x.body).toEqual({b: 'BBB'}))
        })
        .then(() => {
            return request(baseUrl)
                .post('/_starworld/clear')
                .expect(200)
        })
        .then(() => {
            return request(baseUrl).get('/test')
                .expect(404)
        })
        .then(() => {
            return request(baseUrl).get('/test2')
                .expect(404)
        })
})

test('Can register multiple endpoints with the same URL.', () => {
    return Promise.all([
        registerEndpoint({
            endpoint: '/test',
            method: 'GET',
            body: {
                a: 'AAA',
            },
        })
            .expect(200),
        registerEndpoint({
            endpoint: '/test',
            method: 'POST',
            body: {
                b: 'BBB',
            },
        })
            .expect(200),
    ])
        .then(() => {
            return request(baseUrl).get('/test')
                .expect(200)
                .expect(x => expect(x.body).toEqual({a: 'AAA'}))
        })
        .then(() => {
            return request(baseUrl).post('/test')
                .expect(200)
                .expect(x => expect(x.body).toEqual({b: 'BBB'}))
        })
})

test('URL parameters are ignored.', () => {
    return registerEndpoint({
        endpoint: '/test',
        method: 'GET',
        body: {
            a: 'AAA',
        },
    })
        .expect(200)
        .then(() => {
            return request(baseUrl).get('/test?blah=1')
                .expect(200)
                .expect(x => expect(x.body).toEqual({a: 'AAA'}))
        })
})

test('Providing no body to the endpoint causes the response body to be an empty string.', () => {
    return registerEndpoint({
        endpoint: '/test',
    })
        .expect(200)
        .then(() => {
            return request(baseUrl).get('/test')
                .expect(200)
                .expect(x => expect(x.body).toBe(''))
        })
})

test('Can register a GET endpoint with multiple responses.', () => {
    return registerEndpoint({
        endpoint: '/test',
        responses: [
            {
                body: {a: 'AAA'},
            },
            {
                status: 500,
                body: {b: 'BBB'},
                headers: {'my-test': 'is good'},
            },
            {
                status: 201,
                respondRaw: true,
                body: 'the response',
            },
        ],
    })
        .expect(200)
        .then(() => {
            return request(baseUrl).get('/test')
                .expect(200)
                .expect(matchesField('a', 'AAA'))
        })
        .then(() => {
            return request(baseUrl).get('/test')
                .expect(500)
                .expect(matchesField('b', 'BBB'))
                .expect(x => expect(filter((_, key) => key === 'my-test', x.headers)).toEqual({'my-test': 'is good'}))
        })
        .then(() => {
            return request(baseUrl).get('/test')
                .expect(201)
                .expect(x => expect(x.text).toBe('the response'))
        })
        // all other responses should be the same
        .then(() => {
            return request(baseUrl).get('/test')
                .expect(201)
                .expect(x => expect(x.text).toBe('the response'))
        })
        .then(() => {
            return request(baseUrl).get('/test')
                .expect(201)
                .expect(x => expect(x.text).toBe('the response'))
        })
})
