#!/usr/bin/env node

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const {getParams, toStr, toInt, toBool, identity} = require('@cullylarson/f')

const isPlainObj = x => typeof x === 'object' && x.constructor === Object

const getEndpointKey = (method, endpoint) => {
    return method.toUpperCase() + '--' + endpoint.toLowerCase()
}

let endpoints = {}

const argv = require('yargs')
    .demandOption(['p'])
    .help('h')
    .describe('p', 'The port to listen on.')
    .argv

const port = argv.p

const app = express()

app.use(cors())

app.use(bodyParser.json())

app.post('/_starworld/register', (req, res) => {
    const params = getParams({
        endpoint: ['', toStr],
        method: ['GET', toStr],
        status: toInt(200),
        headers: [{}, x => isPlainObj(x) ? x : {}],
        respondRaw: [false, toBool],
        body: ['', identity],
    }, req.body)

    if(!params.endpoint) {
        return res.end()
    }

    endpoints[getEndpointKey(params.method, params.endpoint)] = {
        ...params,
        method: params.method.toUpperCase(),
    }

    return res.end()
})

app.post('/_starworld/clear', (req, res) => {
    const params = getParams({
        endpoint: ['', toStr],
        method: ['GET', toStr],
    }, req.body)

    if(!params.endpoint) {
        endpoints = {}

        return res.end()
    }
    else {
        delete endpoints[getEndpointKey(params.method, params.endpoint)]
        return res.end()
    }
})

app.all('*', (req, res) => {
    const endpoint = endpoints[getEndpointKey(req.method, req.path)]

    if(!endpoint) return res.status(404).end()

    res.set(endpoint.headers)
    res.status(endpoint.status)

    if(endpoint.respondRaw) {
        return res.send(endpoint.body)
    }
    else {
        return res.json(endpoint.body)
    }
})

app.listen(port)
