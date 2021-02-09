#!/usr/bin/env node

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const {pick, getParams, toStr, toInt, toBool, identity} = require('@cullylarson/f')

const isPlainObj = x => typeof x === 'object' && x.constructor === Object

const getEndpointKey = (method, endpointPath) => {
    return method.toUpperCase() + '--' + endpointPath.toLowerCase()
}

const getResponseInfo = (endpoints, req) => {
    const endpointKey = getEndpointKey(req.method, req.path)

    const endpoint = endpoints[endpointKey]

    if(!endpoint) {
        return null
    }

    if(endpoint.responses && endpoint.responses.length) {
        // if only one item left, just keep returning it as the response
        if(endpoint.responses.length === 1) {
            return endpoint.responses[0]
        }
        else {
            return endpoint.responses.shift()
        }
    }
    else {
        return pick([
            'status',
            'headers',
            'respondRaw',
            'body',
        ], endpoint)
    }
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
    const responseInfoParamsDef = {
        status: toInt(200),
        headers: [{}, x => isPlainObj(x) ? x : {}],
        respondRaw: [false, toBool],
        body: ['', identity],
    }

    const params = getParams({
        ...responseInfoParamsDef,
        endpoint: ['', toStr],
        method: ['GET', toStr],
        responses: [[], xs => {
            return Array.isArray(xs)
                ? xs.map(getParams(responseInfoParamsDef))
                : []
        }],
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
    const responseInfo = getResponseInfo(endpoints, req)

    if(!responseInfo) return res.status(404).end()

    res.set(responseInfo.headers)
    res.status(responseInfo.status)

    if(responseInfo.respondRaw) {
        return res.send(responseInfo.body)
    }
    else {
        return res.json(responseInfo.body)
    }
})

app.listen(port)
